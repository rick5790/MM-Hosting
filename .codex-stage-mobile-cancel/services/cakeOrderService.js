const { db } = require("../db");
const { formatAccountId } = require("./authService");
const { getCanonicalUserId, getLinkedUserIds } = require("./userLinkService");
const { notifyNewCakeOrder } = require("./telegram");

// 蛋糕订单状态机：和周订单相互独立。
const VALID_STATUSES = ["pending", "confirmed", "making", "ready", "completed", "cancelled"];
const USER_CANCEL_REASON = "用户主动取消";

// 服务端权威目录：价格、口味都以这里为准，不信任前端传来的价格。
// 两款都是六寸、每单 1 个。
const CAKE_CATALOG = {
  quartet: {
    id: "quartet",
    name: "稻香米奶油四重奏",
    price: 88,
    // 单一口味：大米戚风 · 米麻薯 · 米布丁 · 米奶油
    flavors: []
  },
  basque: {
    id: "basque",
    name: "巴斯克蛋糕",
    price: 68,
    flavors: [
      "提拉米苏巴斯克", "黑芝麻豆乳巴斯克", "斑斓芭乐巴斯克", "伯爵茶巴斯克",
      "蔓越莓巴斯克", "覆盆子巴斯克", "百香果西米巴斯克", "绿豆沙巴斯克",
      "芋泥巴斯克", "抹茶巴斯克", "山楂巴斯克", "咸蛋黄麻薯巴斯克",
      "雪媚娘巴斯克", "海盐榴莲巴斯克", "酒酿姜撞奶巴斯克", "法葱巴斯克",
      "龙井抹茶巴斯克"
    ]
  }
};

// 最少提前天数：今天 + 14 天（2 周）之后才可自提。
const MIN_LEAD_DAYS = 14;

function formatMoney(amount) {
  const normalized = Math.round((Number(amount) || 0) * 100) / 100;
  return Number.isInteger(normalized) ? `$${normalized}` : `$${normalized.toFixed(2)}`;
}

function makeHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// ── 美国联邦节假日（按年计算，返回 'YYYY-MM-DD' 集合）──
function pad(n) {
  return String(n).padStart(2, "0");
}

function ymd(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

// 某年某月的第 n 个星期几（weekday: 0=周日..6=周六）
function nthWeekdayOfMonth(year, month, weekday, n) {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const offset = (weekday - first + 7) % 7;
  return 1 + offset + (n - 1) * 7;
}

// 某年某月最后一个星期几
function lastWeekdayOfMonth(year, month, weekday) {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last = new Date(Date.UTC(year, month - 1, daysInMonth)).getUTCDay();
  const offset = (last - weekday + 7) % 7;
  return daysInMonth - offset;
}

function usFederalHolidays(year) {
  return new Set([
    ymd(year, 1, 1),                                        // 元旦
    ymd(year, 1, nthWeekdayOfMonth(year, 1, 1, 3)),         // MLK 日（1月第3个周一）
    ymd(year, 2, nthWeekdayOfMonth(year, 2, 1, 3)),         // 总统日（2月第3个周一）
    ymd(year, 5, lastWeekdayOfMonth(year, 5, 1)),           // 阵亡将士纪念日（5月最后周一）
    ymd(year, 6, 19),                                       // 六月节
    ymd(year, 7, 4),                                        // 独立日
    ymd(year, 9, nthWeekdayOfMonth(year, 9, 1, 1)),         // 劳动节（9月第1个周一）
    ymd(year, 10, nthWeekdayOfMonth(year, 10, 1, 2)),       // 哥伦布日（10月第2个周一）
    ymd(year, 11, 11),                                      // 退伍军人节
    ymd(year, 11, nthWeekdayOfMonth(year, 11, 4, 4)),       // 感恩节（11月第4个周四）
    ymd(year, 12, 25)                                       // 圣诞节
  ]);
}

// 本地（洛杉矶）今天的 'YYYY-MM-DD'。服务器时区未必是 PST，用 en-CA 强制 LA 日历日。
function laToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
  return parts; // en-CA 输出即 YYYY-MM-DD
}

function daysBetween(fromYmd, toYmd) {
  const from = new Date(`${fromYmd}T00:00:00Z`).getTime();
  const to = new Date(`${toYmd}T00:00:00Z`).getTime();
  return Math.round((to - from) / 86400000);
}

// 权威校验自提日期：格式合法、≥ 今天+14 天、非联邦节假日。
function validatePickupDate(dateStr) {
  const value = String(dateStr || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw makeHttpError(400, "自提日期格式不正确");
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw makeHttpError(400, "自提日期不存在");
  }
  const today = laToday();
  if (daysBetween(today, value) < MIN_LEAD_DAYS) {
    throw makeHttpError(400, `蛋糕需至少提前 ${MIN_LEAD_DAYS} 天预定`);
  }
  const year = Number(value.slice(0, 4));
  if (usFederalHolidays(year).has(value)) {
    throw makeHttpError(400, "该日期为节假日，暂不接单");
  }
  return value;
}

function decorateCakeOrder(order) {
  if (!order) return null;
  return {
    id: order.id,
    uuid: String(order.id),
    orderType: "cake",
    orderNumber: String(order.id),
    user_id: order.user_id,
    canonical_user_id: getCanonicalUserId(order.user_id),
    userUuid: formatAccountId(order.user_id),
    userNickname: order.user_nickname || order.customer_name || "微信用户",
    userAvatarUrl: order.user_avatar_url || "",
    cake_id: order.cake_id,
    cakeId: order.cake_id,
    cake_name: order.cake_name,
    cakeName: order.cake_name,
    flavor: order.flavor || "",
    unit_price: order.unit_price,
    unitPrice: order.unit_price,
    total_amount: order.unit_price,
    total: {
      amount: order.unit_price,
      text: formatMoney(order.unit_price),
      currency: "USD"
    },
    pickup_date: order.pickup_date,
    pickupDate: order.pickup_date,
    preferred_time: order.preferred_time || "",
    preferredTime: order.preferred_time || "",
    customer_name: order.customer_name || "",
    status: order.status,
    notes: order.notes || "",
    admin_comment: order.admin_comment || "",
    adminComment: order.admin_comment || "",
    cancel_reason: order.cancel_reason || "",
    cancelReason: order.cancel_reason || "",
    cancelled_at: order.cancelled_at || "",
    cancelledAt: order.cancelled_at || "",
    admin_seen_at: order.admin_seen_at || "",
    adminSeenAt: order.admin_seen_at || "",
    created_at: order.created_at,
    createdAt: order.created_at,
    updated_at: order.updated_at,
    updatedAt: order.updated_at
  };
}

function getCakeOrderHeader(orderId) {
  return db
    .prepare(`
      SELECT
        c.*,
        u.nickname AS user_nickname,
        u.avatar_url AS user_avatar_url
      FROM cake_orders c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = ?
    `)
    .get(orderId);
}

function getCakeOrderById(orderId) {
  return decorateCakeOrder(getCakeOrderHeader(orderId));
}

function createCakeOrder(user, body) {
  const userId = Number(body.user_id || user.id);
  if (userId !== Number(user.id)) {
    throw makeHttpError(403, "不能替其他用户下单");
  }

  const cakeId = String(body.cake_id || "").trim();
  const cake = CAKE_CATALOG[cakeId];
  if (!cake) throw makeHttpError(400, "蛋糕款式不存在");

  let flavor = String(body.flavor || "").trim();
  if (cake.flavors.length) {
    if (!flavor) throw makeHttpError(400, "请选择口味");
    if (!cake.flavors.includes(flavor)) throw makeHttpError(400, "口味不存在");
  } else {
    flavor = ""; // 单一口味蛋糕不需要口味
  }

  const pickupDate = validatePickupDate(body.pickup_date);
  const preferredTime = String(body.preferred_time || "").trim().slice(0, 100);
  const notes = String(body.notes || "").slice(0, 1000);
  const customerName = String(body.customer_name || user.nickname || "微信用户").slice(0, 200);

  const result = db
    .prepare(`
      INSERT INTO cake_orders (
        user_id, cake_id, cake_name, flavor, unit_price,
        pickup_date, preferred_time, customer_name, status, notes,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `)
    .run(
      user.id,
      cake.id,
      cake.name,
      flavor,
      cake.price,
      pickupDate,
      preferredTime,
      customerName,
      notes
    );

  const order = getCakeOrderById(result.lastInsertRowid);
  setImmediate(() => {
    notifyNewCakeOrder(order).catch((error) => {
      console.error("Telegram cake notification failed:", error);
    });
  });
  return order;
}

function getCakeOrdersByUser(userId) {
  const linkedIds = getLinkedUserIds(userId);
  if (!linkedIds.length) return [];
  return db
    .prepare(`SELECT id FROM cake_orders WHERE user_id IN (${linkedIds.map(() => "?").join(",")}) ORDER BY created_at DESC, id DESC`)
    .all(...linkedIds)
    .map((row) => getCakeOrderById(row.id));
}

function getAllCakeOrders() {
  return db
    .prepare("SELECT id FROM cake_orders ORDER BY created_at DESC, id DESC")
    .all()
    .map((row) => getCakeOrderById(row.id));
}

function updateCakeOrderStatus(orderId, status, cancelReason) {
  if (!VALID_STATUSES.includes(status)) {
    throw makeHttpError(400, "订单状态不正确");
  }
  const current = getCakeOrderHeader(orderId);
  if (!current) throw makeHttpError(404, "订单不存在");

  const nextReason = status === "cancelled" ? String(cancelReason || "").slice(0, 500) : "";
  db
    .prepare(`
      UPDATE cake_orders
      SET status = ?,
          cancel_reason = ?,
          cancelled_at = CASE
            WHEN ? = 'cancelled' THEN COALESCE(cancelled_at, CURRENT_TIMESTAMP)
            ELSE NULL
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(status, nextReason, status, orderId);
  return getCakeOrderById(orderId);
}

// 管理员可按实际沟通结果调整自提日期。这里只校验日期本身，不套用用户下单时的
// 14 天提前量与节假日限制；修改的是同一条询单，因此用户端再次读取时会同步显示。
function updateCakeOrderPickupDate(orderId, pickupDate) {
  const current = getCakeOrderHeader(orderId);
  if (!current) throw makeHttpError(404, "订单不存在");

  const value = String(pickupDate || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw makeHttpError(400, "自提日期格式不正确");
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw makeHttpError(400, "自提日期不存在");
  }

  db
    .prepare("UPDATE cake_orders SET pickup_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(value, orderId);
  return getCakeOrderById(orderId);
}

function cancelCakeOrder(orderId, user) {
  const current = getCakeOrderHeader(orderId);
  if (!current) throw makeHttpError(404, "订单不存在");
  if (Number(getCanonicalUserId(current.user_id)) !== Number(getCanonicalUserId(user.id))) {
    throw makeHttpError(403, "不能取消别人的订单");
  }
  if (current.status !== "pending") {
    throw makeHttpError(409, "当前状态不可取消");
  }
  const result = db
    .prepare(`
      UPDATE cake_orders
      SET status = 'cancelled',
          cancel_reason = ?,
          cancelled_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'pending'
    `)
    .run(USER_CANCEL_REASON, orderId);
  if (!result.changes) throw makeHttpError(409, "当前状态不可取消");
  return getCakeOrderById(orderId);
}

function getUnseenCakeOrderCount() {
  const row = db.prepare("SELECT COUNT(*) AS count FROM cake_orders WHERE admin_seen_at IS NULL").get();
  return Number(row && row.count) || 0;
}

function markAllCakeOrdersSeen() {
  const result = db
    .prepare("UPDATE cake_orders SET admin_seen_at = CURRENT_TIMESTAMP WHERE admin_seen_at IS NULL")
    .run();
  return { updated: Number(result && result.changes) || 0, count: getUnseenCakeOrderCount() };
}

// 前端日历用：返回配置（最少提前天数 + 相关年份的联邦节假日），可选公开接口使用。
function getCakeBookingConfig() {
  const today = laToday();
  const year = Number(today.slice(0, 4));
  const holidays = [...usFederalHolidays(year), ...usFederalHolidays(year + 1)];
  return {
    min_lead_days: MIN_LEAD_DAYS,
    today,
    holidays,
    catalog: Object.values(CAKE_CATALOG)
  };
}

module.exports = {
  CAKE_CATALOG,
  createCakeOrder,
  getCakeOrderById,
  getCakeOrdersByUser,
  getAllCakeOrders,
  updateCakeOrderStatus,
  updateCakeOrderPickupDate,
  cancelCakeOrder,
  getUnseenCakeOrderCount,
  markAllCakeOrdersSeen,
  getCakeBookingConfig
};
