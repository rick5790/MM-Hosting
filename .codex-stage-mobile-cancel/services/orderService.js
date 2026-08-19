const { db } = require("../db");
const { randomUUID } = require("crypto");
const { formatAccountId, normalizeUser } = require("./authService");
const { getCanonicalUserId, getLinkedOrderStats, getLinkedUserIds } = require("./userLinkService");
const {
  getActiveGroupId,
  getWeeklyOrderAvailability,
  getPayDeadlineMs
} = require("./weeklyOrderService");
const { notifyNewOrder } = require("./telegram");
const { CAKE_CATALOG } = require("./cakeOrderService");

const VALID_STATUSES = ["pending", "paid", "making", "ready", "completed", "activity", "cancelled"];
const VALID_PAYMENT_STATUSES = ["non_paid", "paid", "refunded"];
const VALID_PAYMENT_METHODS = ["cash", "venmo", "zelle", "alipay", "deposit"];
const USER_CANCEL_REASON = "用户主动取消";

function formatMoney(amount) {
  const normalized = Math.round((Number(amount) || 0) * 100) / 100;
  return Number.isInteger(normalized) ? `$${normalized}` : `$${normalized.toFixed(2)}`;
}

function moneyToCents(amount) {
  return Math.max(0, Math.round((Number(amount) || 0) * 100));
}

function centsToMoney(cents) {
  return Math.round((Number(cents) || 0)) / 100;
}

function makeHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getOrderHeader(orderId) {
  return db
    .prepare(`
      SELECT
        o.*,
        u.nickname AS user_nickname,
        u.avatar_url AS user_avatar_url,
        p.name AS pickup_name,
        p.address AS pickup_address
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN pickup_locations p ON p.id = o.pickup_location_id
      WHERE o.id = ?
    `)
    .get(orderId);
}

function getOrderItems(orderId) {
  return db
    .prepare(`
      SELECT
        oi.id,
        oi.order_id,
        oi.product_id,
        NULL AS collection_item_id,
        oi.quantity,
        oi.unit_price,
        oi.subtotal,
        p.name,
        p.image_url,
        'product' AS item_source
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?

      UNION ALL

      SELECT
        mi.id,
        mi.order_id,
        NULL AS product_id,
        mi.collection_item_id,
        mi.quantity,
        mi.unit_price,
        mi.subtotal,
        mi.item_name AS name,
        mi.item_image_url AS image_url,
        COALESCE(NULLIF(mi.item_source, ''), 'collection') AS item_source
      FROM manual_order_items mi
      WHERE mi.order_id = ?

      ORDER BY item_source ASC, id ASC
    `)
    .all(orderId, orderId);
}

function decorateOrder(order) {
  if (!order) return null;

  const groupOrderNumber = Number(order.group_order_number) || null;
  const paymentStatus = VALID_PAYMENT_STATUSES.includes(String(order.payment_status || ""))
    ? String(order.payment_status)
    : "non_paid";
  const paymentMethod = String(order.payment_method || "");
  const grossAmount = centsToMoney(moneyToCents(order.total_amount));
  const depositApplied = centsToMoney(moneyToCents(order.deposit_applied));
  const amountDue = order.amount_due == null
    ? grossAmount
    : centsToMoney(moneyToCents(order.amount_due));
  const availability = getWeeklyOrderAvailability();
  const customerCanCancel = order.status === "pending"
    && String(order.group_id || "") === String(getActiveGroupId() || "")
    && availability.accepting;
  const items = getOrderItems(order.id).map((item) => ({
    id: item.product_id ? String(item.product_id) : `${item.item_source || "collection"}-${item.collection_item_id || item.id}`,
    product_id: item.product_id,
    collection_item_id: item.collection_item_id,
    item_source: item.item_source,
    title: item.name,
    quantity: item.quantity,
    price: `${formatMoney(item.unit_price)} / 个`,
    unitPrice: item.unit_price,
    subtotal: item.subtotal,
    subtotalText: formatMoney(item.subtotal),
    image: item.image_url || ""
  }));

  return {
    id: order.id,
    uuid: String(order.id),
    orderNumber: groupOrderNumber ? String(groupOrderNumber) : String(order.id),
    groupOrderNumber,
    group_order_number: groupOrderNumber,
    groupOrderNumberText: groupOrderNumber ? `${groupOrderNumber}号` : "",
    weeklyOrderNumber: order.weekly_order_number || "",
    weekly_order_number: order.weekly_order_number || "",
    groupId: order.group_id || "",
    group_id: order.group_id || "",
    user_id: order.user_id,
    canonical_user_id: getCanonicalUserId(order.user_id),
    userUuid: formatAccountId(order.user_id),
    userNickname: order.user_nickname || order.customer_name || "微信用户",
    userAvatarUrl: order.user_avatar_url || "",
    pickup_location_id: order.pickup_location_id,
    pickup: {
      id: order.pickup_location_id,
      label: order.pickup_name,
      name: order.pickup_name,
      address: order.pickup_address,
      time: order.pickup_time
    },
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    pickup_time: order.pickup_time,
    total_amount: grossAmount,
    total: {
      amount: grossAmount,
      text: formatMoney(grossAmount),
      currency: "USD"
    },
    deposit_applied: depositApplied,
    depositApplied,
    amount_due: amountDue,
    amountDue,
    payable: {
      amount: amountDue,
      text: formatMoney(amountDue),
      currency: "USD"
    },
    status: order.status,
    inventory_managed: Number(order.inventory_managed == null ? 1 : order.inventory_managed) !== 0,
    customer_can_cancel: customerCanCancel,
    customerCanCancel,
    notes: order.notes,
    cancel_reason: order.cancel_reason || "",
    cancelReason: order.cancel_reason || "",
    cancelled_at: order.cancelled_at || "",
    cancelledAt: order.cancelled_at || "",
    admin_comment: order.admin_comment || "",
    payment_status: paymentStatus,
    paymentStatus,
    payment_method: paymentMethod,
    paymentMethod,
    payment_note: order.payment_note || "",
    paymentNote: order.payment_note || "",
    paid_at: order.paid_at || "",
    paidAt: order.paid_at || "",
    payment_marked_by: order.payment_marked_by || "",
    admin_seen_at: order.admin_seen_at || "",
    adminSeenAt: order.admin_seen_at || "",
    created_at: order.created_at,
    updated_at: order.updated_at,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items
  };
}

function getNextGroupOrderNumber(groupId) {
  const row = db
    .prepare(`
      SELECT COALESCE(MAX(group_order_number), 0) + 1 AS next_number
      FROM orders
      WHERE group_id = ?
    `)
    .get(groupId);
  return Number(row && row.next_number) || 1;
}

function normalizeManualGroupDate(value, fallback = "") {
  const date = String(value || fallback || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw makeHttpError(400, "团购日期格式不正确");
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw makeHttpError(400, "团购日期不存在");
  }
  return date;
}

function normalizeOptionalManualDate(value, fallback = "") {
  const date = String(value || fallback || "").trim();
  return date ? normalizeManualGroupDate(date) : "";
}

function getManualOrderGroups() {
  return db.prepare(`
    SELECT
      o.group_id,
      COALESCE(m.title, '') AS title,
      COALESCE(NULLIF(m.order_date, ''), substr(MIN(o.created_at), 1, 10)) AS order_date,
      COALESCE(
        NULLIF(m.pickup_date, ''),
        MAX(CASE WHEN o.pickup_time GLOB '????-??-??*' THEN substr(o.pickup_time, 1, 10) ELSE '' END),
        ''
      ) AS pickup_date,
      COUNT(o.id) AS order_count
    FROM orders o
    LEFT JOIN manual_order_groups m ON m.group_id = o.group_id
    WHERE COALESCE(o.group_id, '') != ''
      AND (COALESCE(o.inventory_managed, 1) = 0 OR o.group_id LIKE 'manual-%')
    GROUP BY o.group_id, m.title, m.order_date, m.pickup_date
    ORDER BY order_date DESC, o.group_id DESC
  `).all().map((row) => ({
    group_id: row.group_id,
    groupId: row.group_id,
    title: row.title || "",
    order_date: row.order_date || "",
    orderDate: row.order_date || "",
    pickup_date: row.pickup_date || "",
    pickupDate: row.pickup_date || "",
    order_count: Number(row.order_count) || 0
  }));
}

function updateManualOrderGroup(groupIdValue, payload = {}) {
  const groupId = String(groupIdValue || payload.group_id || "").trim();
  if (!groupId || /[\u0000-\u001f\u007f]/.test(groupId) || groupId.length > 48) {
    throw makeHttpError(400, "团购编号格式不正确");
  }
  const existing = db.prepare(`
    SELECT id FROM orders
    WHERE group_id = ? AND (COALESCE(inventory_managed, 1) = 0 OR group_id LIKE 'manual-%')
    LIMIT 1
  `).get(groupId);
  if (!existing) throw makeHttpError(404, "手动历史团购不存在");

  const title = String(payload.title || "").trim().slice(0, 120);
  const orderDate = normalizeManualGroupDate(payload.order_date);
  const pickupDate = normalizeOptionalManualDate(payload.pickup_date);
  db.prepare(`
    INSERT INTO manual_order_groups (group_id, title, order_date, pickup_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(group_id) DO UPDATE SET
      title = excluded.title,
      order_date = excluded.order_date,
      pickup_date = excluded.pickup_date,
      updated_at = CURRENT_TIMESTAMP
  `).run(groupId, title, orderDate, pickupDate);

  return getManualOrderGroups().find((group) => group.group_id === groupId);
}

function createOrder(user, body) {
  const weeklyAvailability = getWeeklyOrderAvailability();
  if (!weeklyAvailability.accepting) {
    throw makeHttpError(400, weeklyAvailability.reason || "本周预定暂未开放");
  }

  const userId = Number(body.user_id || user.id);
  if (userId !== Number(user.id)) {
    throw makeHttpError(403, "不能替其他用户下单");
  }

  const pickupLocationId = Number(body.pickup_location_id);
  const cartItems = Array.isArray(body.cart_items) ? body.cart_items : [];

  if (!pickupLocationId) throw makeHttpError(400, "缺少 pickup_location_id");
  if (!cartItems.length) throw makeHttpError(400, "购物车为空");

  const pickupLocation = db
    .prepare("SELECT * FROM pickup_locations WHERE id = ? AND is_active = 1")
    .get(pickupLocationId);
  if (!pickupLocation) throw makeHttpError(400, "取货点不存在");

  const groupId = weeklyAvailability.weeklyOrder && weeklyAvailability.weeklyOrder.active_group_id
    ? String(weeklyAvailability.weeklyOrder.active_group_id)
    : getActiveGroupId();

  // 该用户在当前团购里、每个商品已下单（未取消）的数量，用于限购累计判定。
  function getUserOrderedQtyInGroup(productId) {
    const linkedIds = getLinkedUserIds(user.id);
    const linkedPlaceholders = linkedIds.map(() => "?").join(",");
    const row = db
      .prepare(`
        SELECT COALESCE(SUM(oi.quantity), 0) AS qty
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.product_id = ?
          AND o.user_id IN (${linkedPlaceholders})
          AND o.group_id = ?
          AND o.status != 'cancelled'
      `)
      .get(productId, ...linkedIds, groupId);
    return Number(row && row.qty) || 0;
  }

  const tx = db.transaction(() => {
    const normalizedItems = cartItems.map((item) => {
      const productId = Number(item.product_id || item.id);
      const quantity = Number(item.quantity);

      if (!productId || !quantity || quantity <= 0) {
        throw makeHttpError(400, "商品数量不正确");
      }

      const product = db
        .prepare("SELECT * FROM products WHERE id = ? AND is_active = 1")
        .get(productId);
      if (!product) throw makeHttpError(400, "商品不存在");
      if (Number(product.stock) < quantity) {
        throw makeHttpError(400, `${product.name} 库存不足`);
      }

      // 限购：本单数量 + 本团购内该用户已下单数量 不能超过 limit_per_order。
      const limitPerOrder = Number(product.limit_per_order);
      if (Number.isFinite(limitPerOrder) && limitPerOrder > 0) {
        const alreadyOrdered = getUserOrderedQtyInGroup(productId);
        if (alreadyOrdered + quantity > limitPerOrder) {
          const remaining = Math.max(0, limitPerOrder - alreadyOrdered);
          throw makeHttpError(
            400,
            remaining > 0
              ? `${product.name} 每人限购 ${limitPerOrder} 个，你还能买 ${remaining} 个`
              : `${product.name} 每人限购 ${limitPerOrder} 个，你已达上限`
          );
        }
      }

      const unitPrice = Number(product.price) || 0;
      return {
        product,
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        subtotal: unitPrice * quantity
      };
    });

    const totalAmountCents = normalizedItems.reduce((sum, item) => sum + moneyToCents(item.subtotal), 0);
    const totalAmount = centsToMoney(totalAmountCents);
    const latestUser = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    if (!latestUser) throw makeHttpError(404, "用户不存在");
    const availableDepositCents = moneyToCents(latestUser.deposit_balance);
    const depositAppliedCents = body.use_deposit === true
      ? Math.min(availableDepositCents, totalAmountCents)
      : 0;
    const depositApplied = centsToMoney(depositAppliedCents);
    const amountDueCents = Math.max(0, totalAmountCents - depositAppliedCents);
    const amountDue = centsToMoney(amountDueCents);
    const coveredByDeposit = depositAppliedCents > 0 && amountDueCents === 0;
    const weeklyOrderNumber = groupId || (weeklyAvailability.weeklyOrder && weeklyAvailability.weeklyOrder.group_no
      ? String(weeklyAvailability.weeklyOrder.group_no)
      : "");
    const groupOrderNumber = getNextGroupOrderNumber(groupId);
    const orderResult = db
      .prepare(`
        INSERT INTO orders (
          user_id,
          weekly_order_number,
          group_id,
          group_order_number,
          pickup_location_id,
          customer_name,
          customer_phone,
          pickup_time,
          total_amount,
          deposit_applied,
          amount_due,
          status,
          payment_status,
          payment_method,
          paid_at,
          payment_marked_by,
          notes,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
      .run(
        user.id,
        weeklyOrderNumber,
        groupId,
        groupOrderNumber,
        pickupLocationId,
        body.customer_name || user.nickname || "微信用户",
        body.customer_phone || user.phone || "",
        body.pickup_time || "",
        totalAmount,
        depositApplied,
        amountDue,
        coveredByDeposit ? "paid" : "non_paid",
        coveredByDeposit ? "deposit" : "",
        coveredByDeposit ? new Date().toISOString() : "",
        coveredByDeposit ? "account-balance" : "",
        body.notes || ""
      );

    const orderId = orderResult.lastInsertRowid;
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `);
    // 原子扣库存：WHERE stock >= ? 保证并发/多进程下不会超卖（例如库存剩 3、两人同时下单 3，
    // 只有一单能成功扣减，另一单 changes=0）。changes!==1 抛错让 better-sqlite3 事务整单回滚。
    const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?");

    normalizedItems.forEach((item) => {
      insertItem.run(orderId, item.product_id, item.quantity, item.unit_price, item.subtotal);
      const stockResult = updateStock.run(item.quantity, item.product_id, item.quantity);
      if (stockResult.changes !== 1) {
        throw makeHttpError(400, `${item.product.name} 库存不足`);
      }
    });

    if (depositAppliedCents > 0) {
      const balanceResult = db
        .prepare(`
          UPDATE users
          SET deposit_balance = ROUND(COALESCE(deposit_balance, 0) - ?, 2)
          WHERE id = ? AND COALESCE(deposit_balance, 0) >= ?
        `)
        .run(depositApplied, user.id, depositApplied);
      if (balanceResult.changes !== 1) {
        throw makeHttpError(409, "账户余额已发生变化，请刷新后重试");
      }
    }

    db
      .prepare(`
        UPDATE users
        SET order_count = COALESCE(order_count, 0) + 1,
            total_spent = COALESCE(total_spent, 0) + ?,
            last_order_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .run(totalAmount, user.id);

    return orderId;
  });

  const orderId = tx();
  const order = decorateOrder(getOrderHeader(orderId));
  const freshUser = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
  setImmediate(() => {
    notifyNewOrder(order).catch((error) => {
      console.error("Telegram notification failed:", error);
    });
  });
  return {
    order,
    user: normalizeUser(freshUser)
  };
}

// 后台补录历史订单：从图鉴保存独立商品快照，不读取或修改本周库存。
// 订单仍计入用户历史与营收，但直接标记为后台已读，也不发送新订单通知。
function createManualHistoricalOrder(payload = {}, admin = null) {
  const customerName = String(payload.customer_name || "").trim().slice(0, 120);
  if (!customerName) throw makeHttpError(400, "请填写客户姓名");

  const pickupLocationId = Number(payload.pickup_location_id);
  const pickupLocation = db.prepare("SELECT * FROM pickup_locations WHERE id = ?").get(pickupLocationId);
  if (!pickupLocation) throw makeHttpError(400, "请选择有效的自提地点");

  const sourceItems = Array.isArray(payload.items) ? payload.items : [];
  if (!sourceItems.length || sourceItems.length > 20) {
    throw makeHttpError(400, "请添加 1 至 20 项商品");
  }

  const allowedStatuses = new Set(VALID_STATUSES.filter((status) => status !== "cancelled"));
  const status = String(payload.status || "completed").trim();
  if (!allowedStatuses.has(status)) throw makeHttpError(400, "订单状态不正确");

  const paymentStatus = normalizePaymentStatus(payload.payment_status, "paid");
  let paymentMethod = paymentStatus === "paid"
    ? normalizePaymentMethod(payload.payment_method || "cash")
    : normalizePaymentMethod(payload.payment_method || "");
  if (paymentStatus === "paid" && !paymentMethod) paymentMethod = "cash";
  if (paymentStatus === "non_paid") paymentMethod = "";

  const parsedCreatedAt = payload.created_at ? new Date(payload.created_at) : new Date();
  if (Number.isNaN(parsedCreatedAt.getTime())) throw makeHttpError(400, "下单时间不正确");
  if (parsedCreatedAt.getTime() > Date.now() + 5 * 60 * 1000) {
    throw makeHttpError(400, "下单时间不能晚于现在");
  }
  const createdAt = parsedCreatedAt.toISOString();
  const dateCode = createdAt.slice(0, 10).replace(/-/g, "");
  const requestedGroupId = String(payload.group_id || "").trim();
  if (/[\u0000-\u001f\u007f]/.test(requestedGroupId) || requestedGroupId.length > 48) {
    throw makeHttpError(400, "团购编号格式不正确");
  }
  const groupId = requestedGroupId || `manual-${dateCode}`;
  if (groupId === String(getActiveGroupId() || "")) {
    throw makeHttpError(400, "手动补录请选择历史团购，不能加入本周订单");
  }
  const groupTitle = String(payload.group_title || "").trim().slice(0, 120);
  const groupDate = normalizeManualGroupDate(payload.group_date, createdAt.slice(0, 10));
  const pickupTimeText = String(payload.pickup_time || pickupLocation.pickup_time || "").trim().slice(0, 160);
  const inferredPickupDate = /^\d{4}-\d{2}-\d{2}/.test(pickupTimeText) ? pickupTimeText.slice(0, 10) : "";
  const groupPickupDate = normalizeOptionalManualDate(payload.pickup_date, inferredPickupDate);

  const requestedUserId = Number(payload.user_id) || 0;
  const adminMarker = formatAdminMarker(admin) || "admin";
  const tx = db.transaction(() => {
    let user = null;
    if (requestedUserId) {
      const canonicalUserId = getCanonicalUserId(requestedUserId);
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(canonicalUserId);
      if (!user) throw makeHttpError(400, "所选客户不存在");
    } else {
      const result = db.prepare(`
        INSERT INTO users (openid, nickname, phone, login_type, tag, note, created_at)
        VALUES (?, ?, ?, 'manual', 'user', '后台手动订单客户', ?)
      `).run(
        `admin-manual:${randomUUID()}`,
        customerName,
        String(payload.customer_phone || "").trim().slice(0, 80),
        createdAt
      );
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
    }

    const seenItems = new Set();
    const normalizedItems = sourceItems.map((item) => {
      const itemSource = String(item.source_type || item.item_source || "").trim().toLowerCase();
      const collectionItemId = Number(item.collection_item_id);
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);
      const unitPriceCents = moneyToCents(item.unit_price);
      if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 999) {
        throw makeHttpError(400, "商品或数量不正确");
      }

      // 新后台传 collection_item_id；保留 product_id 兼容部署瞬间仍开着的旧后台页面，
      // 但两种来源都只保存快照，绝不检查或扣减 products.stock。
      let source = null;
      let itemKey = "";
      if (itemSource === "cake" || item.cake_id) {
        const cakeId = String(item.cake_id || "").trim();
        const cake = CAKE_CATALOG[cakeId];
        if (!cake) throw makeHttpError(400, "蛋糕图鉴商品不存在");
        const flavor = String(item.flavor || "").trim();
        if (cake.flavors.length && !cake.flavors.includes(flavor)) {
          throw makeHttpError(400, "请选择有效的蛋糕口味");
        }
        if (!cake.flavors.length && flavor) throw makeHttpError(400, "此蛋糕没有口味选项");
        itemKey = `cake:${cakeId}:${flavor}`;
        source = {
          collection_item_id: null,
          item_source: "cake",
          item_name: `${cake.name}${flavor ? ` · ${flavor}` : ""}`,
          item_image_url: ""
        };
      } else if (Number.isInteger(collectionItemId) && collectionItemId > 0) {
        const collectionItem = db.prepare("SELECT * FROM collection_items WHERE id = ?").get(collectionItemId);
        if (!collectionItem) throw makeHttpError(400, "图鉴商品不存在");
        itemKey = `collection:${collectionItemId}`;
        source = {
          collection_item_id: collectionItemId,
          item_source: "collection",
          item_name: collectionItem.name,
          item_image_url: collectionItem.image_file
            ? `/uploads/collection/${encodeURIComponent(collectionItem.image_file)}`
            : ""
        };
      } else if (Number.isInteger(productId) && productId > 0) {
        const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId);
        if (!product) throw makeHttpError(400, "商品不存在");
        itemKey = `product:${productId}`;
        source = {
          collection_item_id: null,
          item_source: "product",
          item_name: product.name,
          item_image_url: product.image_url || ""
        };
      } else {
        throw makeHttpError(400, "请选择图鉴商品");
      }

      if (seenItems.has(itemKey)) throw makeHttpError(400, "同一商品请合并为一项");
      seenItems.add(itemKey);
      return {
        ...source,
        quantity,
        unit_price: centsToMoney(unitPriceCents),
        subtotal: centsToMoney(unitPriceCents * quantity)
      };
    });

    const totalAmountCents = normalizedItems.reduce((sum, item) => sum + moneyToCents(item.subtotal), 0);
    const totalAmount = centsToMoney(totalAmountCents);
    let depositApplied = 0;
    if (paymentMethod === "deposit") {
      const availableCents = moneyToCents(user.deposit_balance);
      if (paymentStatus !== "paid" || availableCents < totalAmountCents) {
        throw makeHttpError(400, "所选客户账户余额不足，或付款状态不是已付款");
      }
      depositApplied = totalAmount;
    }
    const amountDue = centsToMoney(totalAmountCents - moneyToCents(depositApplied));
    const requestedOrderNumberText = String(payload.group_order_number == null ? "" : payload.group_order_number).trim();
    let groupOrderNumber = getNextGroupOrderNumber(groupId);
    if (requestedOrderNumberText) {
      const requestedOrderNumber = Number(requestedOrderNumberText);
      if (!Number.isInteger(requestedOrderNumber) || requestedOrderNumber <= 0 || requestedOrderNumber > 999999) {
        throw makeHttpError(400, "订单编号需为 1 至 999999 的整数");
      }
      const duplicate = db.prepare(`
        SELECT id FROM orders
        WHERE COALESCE(group_id, weekly_order_number, '') = ? AND group_order_number = ?
        LIMIT 1
      `).get(groupId, requestedOrderNumber);
      if (duplicate) throw makeHttpError(409, `团购 ${groupId} 已有 ${requestedOrderNumber} 号订单`);
      groupOrderNumber = requestedOrderNumber;
    }
    const paidAt = paymentStatus === "paid" ? createdAt : "";
    const orderResult = db.prepare(`
      INSERT INTO orders (
        user_id, weekly_order_number, group_id, group_order_number, inventory_managed,
        pickup_location_id, customer_name, customer_phone, pickup_time,
        total_amount, deposit_applied, amount_due, status,
        payment_status, payment_method, payment_note, paid_at,
        payment_marked_by, admin_seen_at, notes, admin_comment, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)
    `).run(
      user.id, groupId, groupId, groupOrderNumber,
      pickupLocationId, customerName, String(payload.customer_phone || user.phone || "").trim().slice(0, 80),
      pickupTimeText,
      totalAmount, depositApplied, amountDue, status,
      paymentStatus, paymentMethod, String(payload.payment_note || "").trim().slice(0, 500), paidAt,
      adminMarker, String(payload.notes || "").trim().slice(0, 1000),
      String(payload.admin_comment || "后台手动补录").trim().slice(0, 1000), createdAt, createdAt
    );

    const orderId = orderResult.lastInsertRowid;
    db.prepare(`
      INSERT OR IGNORE INTO manual_order_groups (group_id, title, order_date, pickup_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(groupId, groupTitle, groupDate, groupPickupDate);
    const insertItem = db.prepare(`
      INSERT INTO manual_order_items (
        order_id, collection_item_id, item_source, item_name, item_image_url, quantity, unit_price, subtotal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    normalizedItems.forEach((item) => {
      insertItem.run(
        orderId,
        item.collection_item_id,
        item.item_source,
        item.item_name,
        item.item_image_url,
        item.quantity,
        item.unit_price,
        item.subtotal
      );
    });

    if (depositApplied > 0) {
      const balanceResult = db.prepare(`
        UPDATE users SET deposit_balance = ROUND(COALESCE(deposit_balance, 0) - ?, 2)
        WHERE id = ? AND COALESCE(deposit_balance, 0) >= ?
      `).run(depositApplied, user.id, depositApplied);
      if (balanceResult.changes !== 1) throw makeHttpError(409, "账户余额已发生变化，请重试");
    }

    const revenueAmount = status === "activity" ? 0 : totalAmount;
    db.prepare(`
      UPDATE users
      SET order_count = COALESCE(order_count, 0) + 1,
          total_spent = COALESCE(total_spent, 0) + ?,
          last_order_at = CASE
            WHEN last_order_at IS NULL OR datetime(last_order_at) < datetime(?) THEN ?
            ELSE last_order_at
          END
      WHERE id = ?
    `).run(revenueAmount, createdAt, createdAt, user.id);

    return { orderId, userId: user.id };
  });

  const result = tx();
  return {
    order: decorateOrder(getOrderHeader(result.orderId)),
    user: normalizeUser(db.prepare("SELECT * FROM users WHERE id = ?").get(result.userId))
  };
}

function getOrderById(orderId) {
  return decorateOrder(getOrderHeader(orderId));
}

function getOrdersByUser(userId) {
  sweepUnpaidOrdersThrottled();
  const linkedIds = getLinkedUserIds(userId);
  if (!linkedIds.length) return [];
  return db
    .prepare(`
      SELECT id
      FROM orders
      WHERE user_id IN (${linkedIds.map(() => "?").join(",")})
      ORDER BY created_at DESC, id DESC
    `)
    .all(...linkedIds)
    .map((row) => getOrderById(row.id));
}

function getAllOrders() {
  sweepUnpaidOrdersThrottled();
  return db
    .prepare(`
      SELECT id
      FROM orders
      ORDER BY created_at DESC, id DESC
    `)
    .all()
    .map((row) => getOrderById(row.id));
}

function getOrdersGroupedByUser() {
  const orders = getAllOrders();
  const groupMap = new Map();

  orders.forEach((order) => {
    const userId = Number(order.user_id);
    if (!groupMap.has(userId)) {
      groupMap.set(userId, {
        userId,
        userNickname: order.userNickname || order.customer_name || "微信用户",
        orderCount: 0,
        totalAmount: 0,
        totalAmountText: "$0",
        latestOrderAt: order.createdAt || order.created_at || "",
        orders: []
      });
    }

    const group = groupMap.get(userId);
    group.orders.push(order);
    group.orderCount += 1;
    group.totalAmount += Number(order.total_amount) || 0;

    const orderTime = new Date(order.createdAt || order.created_at || 0).getTime();
    const latestTime = new Date(group.latestOrderAt || 0).getTime();
    if (!Number.isNaN(orderTime) && (Number.isNaN(latestTime) || orderTime > latestTime)) {
      group.latestOrderAt = order.createdAt || order.created_at || "";
    }
  });

  return Array.from(groupMap.values())
    .map((group) => ({
      ...group,
      totalAmount: Math.round(group.totalAmount * 100) / 100,
      totalAmountText: formatMoney(group.totalAmount),
      orders: group.orders.sort((a, b) => {
        const bTime = new Date(b.createdAt || b.created_at || 0).getTime();
        const aTime = new Date(a.createdAt || a.created_at || 0).getTime();
        return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
      })
    }))
    .sort((a, b) => {
      const bTime = new Date(b.latestOrderAt || 0).getTime();
      const aTime = new Date(a.latestOrderAt || 0).getTime();
      return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    });
}

function getOrdersGroupedByGroupId() {
  const orders = getAllOrders();
  const groupMap = new Map();

  orders.forEach((order) => {
    const groupId = String(order.group_id || order.groupId || "").trim() || "未分组";
    if (!groupMap.has(groupId)) {
      groupMap.set(groupId, {
        key: groupId,
        groupId,
        group_id: groupId,
        orderCount: 0,
        totalAmount: 0,
        totalAmountText: "$0",
        pendingCount: 0,
        completedCount: 0,
        latestOrderAt: order.createdAt || order.created_at || "",
        orders: []
      });
    }

    const group = groupMap.get(groupId);
    const status = String(order.status || "");
    group.orders.push(order);
    group.orderCount += 1;
    if (status !== "cancelled" && status !== "activity") group.totalAmount += Number(order.total_amount) || 0;
    if (status === "completed" || status === "activity") group.completedCount += 1;
    if (status !== "completed" && status !== "activity" && status !== "cancelled") group.pendingCount += 1;

    const orderTime = new Date(order.createdAt || order.created_at || 0).getTime();
    const latestTime = new Date(group.latestOrderAt || 0).getTime();
    if (!Number.isNaN(orderTime) && (Number.isNaN(latestTime) || orderTime > latestTime)) {
      group.latestOrderAt = order.createdAt || order.created_at || "";
    }
  });

  return Array.from(groupMap.values())
    .map((group) => ({
      ...group,
      totalAmount: Math.round(group.totalAmount * 100) / 100,
      totalAmountText: formatMoney(group.totalAmount),
      orders: group.orders.sort((a, b) => {
        const bTime = new Date(b.createdAt || b.created_at || 0).getTime();
        const aTime = new Date(a.createdAt || a.created_at || 0).getTime();
        return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
      })
    }))
    .sort((a, b) => {
      if (a.groupId === "未分组") return 1;
      if (b.groupId === "未分组") return -1;
      return String(b.groupId).localeCompare(String(a.groupId));
    });
}

function applyOrderTotalsForStatusChange(order, nextStatus) {
  const accountingUserId = getCanonicalUserId(order.user_id) || Number(order.user_id);
  const wasCancelled = order.status === "cancelled";
  const willBeCancelled = nextStatus === "cancelled";
  const wasActivity = order.status === "activity";
  const willBeActivity = nextStatus === "activity";
  const orderAmount = Number(order.total_amount) || 0;
  const previousRevenue = !wasCancelled && !wasActivity ? orderAmount : 0;
  const nextRevenue = !willBeCancelled && !willBeActivity ? orderAmount : 0;
  const revenueDelta = nextRevenue - previousRevenue;
  const inventoryManaged = Number(order.inventory_managed == null ? 1 : order.inventory_managed) !== 0;

  if (wasCancelled === willBeCancelled) {
    if (revenueDelta !== 0) {
      db
        .prepare("UPDATE users SET total_spent = MAX(COALESCE(total_spent, 0) + ?, 0) WHERE id = ?")
        .run(revenueDelta, accountingUserId);
    }
    return;
  }

  const items = getOrderItems(order.id);
  const depositApplied = centsToMoney(moneyToCents(order.deposit_applied));

  if (willBeCancelled) {
    if (inventoryManaged) {
      const restoreStock = db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
      items.filter((item) => item.product_id).forEach((item) => {
        restoreStock.run(item.quantity, item.product_id);
      });
    }

    db
      .prepare(`
        UPDATE users
        SET order_count = MAX(COALESCE(order_count, 0) - 1, 0),
            total_spent = MAX(COALESCE(total_spent, 0) + ?, 0),
            deposit_balance = ROUND(COALESCE(deposit_balance, 0) + ?, 2)
        WHERE id = ?
      `)
      .run(revenueDelta, depositApplied, accountingUserId);
    if (depositApplied > 0 && moneyToCents(order.amount_due) === 0) {
      db.prepare("UPDATE orders SET payment_status = 'refunded' WHERE id = ?").run(order.id);
    }
    return;
  }

  if (inventoryManaged) {
    // 恢复（取消→非取消）时同样用原子扣减，避免并发下把库存扣成负数。
    const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?");
    items.filter((item) => item.product_id).forEach((item) => {
      const stockResult = updateStock.run(item.quantity, item.product_id, item.quantity);
      if (stockResult.changes !== 1) {
        const product = db.prepare("SELECT name FROM products WHERE id = ?").get(item.product_id);
        throw makeHttpError(409, `${product ? product.name : "商品"} 库存不足，无法恢复订单`);
      }
    });
  }

  const restoreOrderResult = db
    .prepare(`
      UPDATE users
      SET order_count = COALESCE(order_count, 0) + 1,
          total_spent = MAX(COALESCE(total_spent, 0) + ?, 0),
          deposit_balance = ROUND(COALESCE(deposit_balance, 0) - ?, 2)
      WHERE id = ? AND COALESCE(deposit_balance, 0) >= ?
    `)
    .run(revenueDelta, depositApplied, accountingUserId, depositApplied);
  if (restoreOrderResult.changes !== 1) {
    throw makeHttpError(409, "用户余额不足，无法恢复该订单");
  }
  if (depositApplied > 0 && moneyToCents(order.amount_due) === 0) {
    db.prepare("UPDATE orders SET payment_status = 'paid' WHERE id = ?").run(order.id);
  }
}

const AUTO_CANCEL_REASON = "超时未付款自动取消";
// 没有常驻定时任务，所以在读订单时顺带清扫一次；用节流避免每个请求都扫。
const SWEEP_THROTTLE_MS = 60 * 1000;
let lastSweepAt = 0;

// 付款窗口（开团 + 60h）过后，把本档期仍是「待处理 + 未付款」的订单自动取消。
// 走 applyOrderTotalsForStatusChange 以便退回库存、扣回用户累计消费。
function sweepUnpaidOrders() {
  const deadlineMs = getPayDeadlineMs();
  if (!deadlineMs || Date.now() < deadlineMs) return 0;

  // 还没截单就不清扫：万一截单时间被设得比「开团 + 60h」还晚，
  // 否则刚下的单会在一分钟内被当成超时取消。
  if (getWeeklyOrderAvailability().accepting) return 0;

  // 只扫当前档期：60h 是按本期 start_at 算的，套到往期订单上没有意义。
  const groupId = String(getActiveGroupId() || "").trim();
  if (!groupId) return 0;

  const rows = db
    .prepare(`
      SELECT id
      FROM orders
      WHERE group_id = ?
        AND status = 'pending'
        AND COALESCE(payment_status, 'non_paid') = 'non_paid'
    `)
    .all(groupId);
  if (!rows.length) return 0;

  const cancelOne = db.prepare(`
    UPDATE orders
    SET status = 'cancelled',
        cancel_reason = ?,
        cancelled_at = COALESCE(cancelled_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'pending'
  `);

  let cancelled = 0;
  rows.forEach((row) => {
    const current = getOrderHeader(row.id);
    if (!current || current.status !== "pending") return;
    try {
      db.transaction(() => {
        applyOrderTotalsForStatusChange(current, "cancelled");
        const result = cancelOne.run(AUTO_CANCEL_REASON, row.id);
        if (!result.changes) throw makeHttpError(409, "订单状态已变更");
      })();
      cancelled += 1;
    } catch (error) {
      // 单个订单失败不应阻断其它订单的清扫。
      console.error(`[auto-cancel] 订单 ${row.id} 取消失败:`, error && error.message);
    }
  });

  if (cancelled) console.log(`[auto-cancel] 档期 ${groupId} 自动取消 ${cancelled} 笔超时未付款订单`);
  return cancelled;
}

// 读订单前的清扫入口：节流 + 吞掉异常，任何失败都不能让订单列表读不出来。
function sweepUnpaidOrdersThrottled() {
  const now = Date.now();
  if (now - lastSweepAt < SWEEP_THROTTLE_MS) return;
  lastSweepAt = now;
  try {
    sweepUnpaidOrders();
  } catch (error) {
    console.error("[auto-cancel] 清扫失败:", error && error.message);
  }
}

function updateOrderStatus(orderId, status, cancelReason) {
  if (!VALID_STATUSES.includes(status)) {
    throw makeHttpError(400, "订单状态不正确");
  }

  const current = getOrderHeader(orderId);
  if (!current) throw makeHttpError(404, "订单不存在");

  // 取消理由：仅当状态为已取消时保存；改成其它状态则清空。
  const nextReason = status === "cancelled" ? String(cancelReason || "").slice(0, 500) : "";

  const tx = db.transaction(() => {
    applyOrderTotalsForStatusChange(current, status);
    db
      .prepare(`
        UPDATE orders
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
  });

  tx();
  return getOrderById(orderId);
}

function cancelOrder(orderId, user) {
  const current = getOrderHeader(orderId);
  if (!current) throw makeHttpError(404, "订单不存在");

  if (Number(getCanonicalUserId(current.user_id)) !== Number(getCanonicalUserId(user.id))) {
    throw makeHttpError(403, "不能取消别人的订单");
  }

  if (current.status !== "pending") {
    throw makeHttpError(409, "当前状态不可取消");
  }

  if (String(current.group_id || "") !== String(getActiveGroupId() || "")) {
    throw makeHttpError(409, "该团购已经结束，请联系管理员处理取消");
  }

  const weeklyAvailability = getWeeklyOrderAvailability();
  if (!weeklyAvailability.accepting) {
    throw makeHttpError(409, "已截单不可取消");
  }

  const tx = db.transaction(() => {
    applyOrderTotalsForStatusChange(current, "cancelled");

    const result = db
      .prepare(`
        UPDATE orders
        SET status = 'cancelled',
            cancel_reason = ?,
            cancelled_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status = 'pending'
      `)
      .run(USER_CANCEL_REASON, orderId);

    if (!result.changes) throw makeHttpError(409, "当前状态不可取消");
  });

  tx();
  return getOrderById(orderId);
}

function updateOrderDetails(orderId, payload = {}) {
  const current = getOrderHeader(orderId);
  if (!current) throw makeHttpError(404, "订单不存在");

  const nextStatus = payload.status !== undefined ? payload.status : current.status;
  if (!VALID_STATUSES.includes(nextStatus)) {
    throw makeHttpError(400, "订单状态不正确");
  }

  const nextNotes = payload.notes !== undefined ? String(payload.notes || "") : (current.notes || "");
  const tx = db.transaction(() => {
    applyOrderTotalsForStatusChange(current, nextStatus);
    db
      .prepare(`
        UPDATE orders
        SET status = ?,
            notes = ?,
            cancel_reason = CASE WHEN ? = 'cancelled' THEN cancel_reason ELSE '' END,
            cancelled_at = CASE
              WHEN ? = 'cancelled' THEN COALESCE(cancelled_at, CURRENT_TIMESTAMP)
              ELSE NULL
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .run(nextStatus, nextNotes, nextStatus, nextStatus, orderId);
  });

  tx();

  return getOrderById(orderId);
}

function normalizePaymentStatus(status, fallback = "non_paid") {
  const nextStatus = String(status || fallback).trim();
  if (!VALID_PAYMENT_STATUSES.includes(nextStatus)) {
    throw makeHttpError(400, "付款状态不正确");
  }
  return nextStatus;
}

function normalizePaymentMethod(method) {
  const value = String(method || "").trim();
  if (!value) return "";
  if (!VALID_PAYMENT_METHODS.includes(value)) {
    throw makeHttpError(400, "付款方式不正确");
  }
  return value;
}

function formatAdminMarker(admin) {
  if (!admin) return "";
  return String(admin.username || admin.nickname || admin.id || "").trim();
}

function updateOrderPayment(orderId, payload = {}, admin = null) {
  const current = getOrderHeader(orderId);
  if (!current) throw makeHttpError(404, "订单不存在");

  const nextPaymentStatus = normalizePaymentStatus(payload.payment_status, current.payment_status || "non_paid");
  const nextPaymentMethod = payload.payment_method !== undefined
    ? normalizePaymentMethod(payload.payment_method)
    : String(current.payment_method || "");
  const nextPaymentNote = payload.payment_note !== undefined
    ? String(payload.payment_note || "")
    : String(current.payment_note || "");
  const nextPaidAt = nextPaymentStatus === "paid" ? (current.paid_at || new Date().toISOString()) : "";
  const paymentMarkedBy = formatAdminMarker(admin) || String(current.payment_marked_by || "");

  db
    .prepare(`
      UPDATE orders
      SET payment_status = ?,
          payment_method = ?,
          payment_note = ?,
          paid_at = ?,
          payment_marked_by = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(nextPaymentStatus, nextPaymentMethod, nextPaymentNote, nextPaidAt, paymentMarkedBy, orderId);

  return getOrderById(orderId);
}

function updateOrderComment(orderId, adminComment, admin = null) {
  const current = getOrderHeader(orderId);
  if (!current) throw makeHttpError(404, "订单不存在");

  const nextComment = String(adminComment || "");
  const paymentMarkedBy = formatAdminMarker(admin) || String(current.payment_marked_by || "");

  db
    .prepare(`
      UPDATE orders
      SET admin_comment = ?,
          payment_marked_by = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(nextComment, paymentMarkedBy, orderId);

  return getOrderById(orderId);
}

function normalizePositiveInteger(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return max ? Math.min(parsed, max) : parsed;
}

function getWeeklySalesAnalytics(weeks = 12) {
  const limit = normalizePositiveInteger(weeks, 12, 104);
  const rows = db
    .prepare(`
      SELECT
        strftime('%Y-%W', created_at) AS week,
        COUNT(*) AS orders,
        COALESCE(SUM(total_amount), 0) AS revenue
      FROM orders
      WHERE status NOT IN ('cancelled', 'activity')
        AND COALESCE(payment_status, 'non_paid') = 'paid'
      GROUP BY week
      ORDER BY week DESC
      LIMIT ?
    `)
    .all(limit);

  return rows
    .reverse()
    .map((row) => ({
      week: row.week,
      orders: row.orders || 0,
      revenue: Number(row.revenue) || 0,
      revenue_text: formatMoney(row.revenue || 0)
    }));
}

function getMemberAnalytics({ sort = "total_spent", limit = 50 } = {}) {
  const allowedSorts = new Set(["total_spent", "order_count"]);
  const sortColumn = allowedSorts.has(sort) ? sort : "total_spent";
  const rowLimit = normalizePositiveInteger(limit, 50, 500);

  return db
    .prepare(`
      SELECT
        id,
        nickname,
        avatar_url,
        COALESCE(order_count, 0) AS order_count,
        COALESCE(total_spent, 0) AS total_spent,
        last_order_at
      FROM users
      ORDER BY ${sortColumn} DESC, id DESC
      LIMIT ?
    `)
    .all(rowLimit)
    .map((row) => ({
      id: row.id,
      nickname: row.nickname || "微信用户",
      avatar_url: row.avatar_url || "",
      order_count: row.order_count || 0,
      total_spent: Number(row.total_spent) || 0,
      total_spent_text: formatMoney(row.total_spent || 0),
      last_order_at: row.last_order_at
    }));
}

const USER_TAGS = new Set(["user", "tester"]);

// 新版 admin UI「用户」页数据源：完整用户列表 + 购买统计 + 标签。
function getMembersForAdmin() {
  const rows = db
    .prepare(`
      SELECT
        id, openid, nickname, avatar_url, email, name, picture, login_type,
        COALESCE(order_count, 0) AS order_count,
        COALESCE(total_spent, 0) AS total_spent,
        last_order_at,
        COALESCE(NULLIF(tag, ''), 'user') AS tag,
        COALESCE(note, '') AS note,
        COALESCE(wechat_id, '') AS wechat_id,
        COALESCE(deposit_balance, 0) AS deposit_balance
      FROM users
      ORDER BY id DESC
    `)
    .all();
  return rows.map((row) => {
    const canonicalUserId = getCanonicalUserId(row.id);
    const linkedUserIds = getLinkedUserIds(row.id);
    const linkedStats = getLinkedOrderStats(row.id);
    const linkedIdentities = rows
      .filter((candidate) => linkedUserIds.includes(Number(candidate.id)))
      .map((candidate) => ({
        id: candidate.id,
        uuid: formatAccountId(candidate.id),
        nickname: candidate.nickname || "微信用户",
        email: candidate.email || "",
        wechat_id: candidate.wechat_id || ""
      }));
    return {
      id: row.id,
      uuid: formatAccountId(row.id),
      client_id: row.openid,
      openid: row.openid,
      nickname: row.nickname || "微信用户",
      name: row.name || row.nickname || "",
      email: row.email || "",
      picture: row.picture || row.avatar_url || "",
      login_type: row.login_type || "guest",
      order_count: Number(linkedStats.order_count) || 0,
      total_spent: Number(linkedStats.total_spent) || 0,
      total_spent_text: formatMoney(linkedStats.total_spent || 0),
      last_order_at: linkedStats.last_order_at || row.last_order_at,
      tag: row.tag || "user",
      note: row.note || "",
      wechat_id: row.wechat_id || "",
      deposit_balance: Math.max(0, Number(row.deposit_balance) || 0),
      canonical_user_id: canonicalUserId,
      is_linked_secondary: Number(canonicalUserId) !== Number(row.id),
      linked_user_ids: linkedUserIds,
      linked_identities: linkedIdentities
    };
  });
}

function updateUserTag(userId, tag) {
  const value = USER_TAGS.has(String(tag)) ? String(tag) : "user";
  const info = db.prepare("UPDATE users SET tag = ? WHERE id = ?").run(value, Number(userId));
  if (!info.changes) {
    throw makeHttpError(404, "用户不存在");
  }
  const row = db
    .prepare("SELECT id, nickname, COALESCE(NULLIF(tag,''),'user') AS tag FROM users WHERE id = ?")
    .get(Number(userId));
  return { id: row.id, nickname: row.nickname, tag: row.tag };
}

// 管理员备注 / 微信号：只更新传入的字段（都可选）。
function updateUserProfile(userId, payload) {
  const fields = [];
  const values = [];
  if (payload && payload.note !== undefined) {
    fields.push("note = ?");
    values.push(String(payload.note || "").slice(0, 2000));
  }
  if (payload && payload.wechat_id !== undefined) {
    fields.push("wechat_id = ?");
    values.push(String(payload.wechat_id || "").trim().slice(0, 200));
  }
  if (payload && payload.deposit_balance !== undefined) {
    const balance = Number(payload.deposit_balance);
    if (!Number.isFinite(balance) || balance < 0 || balance > 99999999) {
      throw makeHttpError(400, "余额格式不正确");
    }
    fields.push("deposit_balance = ?");
    values.push(Math.round(balance * 100) / 100);
  }
  if (!fields.length) throw makeHttpError(400, "没有可更新的字段");
  values.push(Number(userId));
  const info = db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  if (!info.changes) throw makeHttpError(404, "用户不存在");
  const row = db
    .prepare("SELECT id, nickname, COALESCE(note,'') AS note, COALESCE(wechat_id,'') AS wechat_id, COALESCE(deposit_balance,0) AS deposit_balance FROM users WHERE id = ?")
    .get(Number(userId));
  return { id: row.id, nickname: row.nickname, note: row.note, wechat_id: row.wechat_id, deposit_balance: Math.max(0, Number(row.deposit_balance) || 0) };
}

function getProductAnalytics(limit = 50) {
  const rowLimit = normalizePositiveInteger(limit, 50, 500);

  return db
    .prepare(`
      SELECT
        p.id,
        p.name,
        p.image_url,
        COALESCE(SUM(oi.quantity), 0) AS quantity,
        COALESCE(SUM(oi.subtotal), 0) AS revenue
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status NOT IN ('cancelled', 'activity')
        AND COALESCE(o.payment_status, 'non_paid') = 'paid'
      GROUP BY p.id, p.name, p.image_url
      ORDER BY quantity DESC, revenue DESC
      LIMIT ?
    `)
    .all(rowLimit)
    .map((row) => ({
      id: row.id,
      name: row.name,
      image_url: row.image_url || "",
      quantity: row.quantity || 0,
      revenue: Number(row.revenue) || 0,
      revenue_text: formatMoney(row.revenue || 0)
    }));
}

function getPickupAnalytics() {
  return db
    .prepare(`
      SELECT
        p.id,
        p.name,
        p.address,
        COUNT(o.id) AS orders,
        COALESCE(SUM(o.total_amount), 0) AS revenue
      FROM orders o
      JOIN pickup_locations p ON p.id = o.pickup_location_id
      WHERE o.status NOT IN ('cancelled', 'activity')
        AND COALESCE(o.payment_status, 'non_paid') = 'paid'
      GROUP BY p.id, p.name, p.address
      ORDER BY revenue DESC, orders DESC
    `)
    .all()
    .map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address || "",
      orders: row.orders || 0,
      revenue: Number(row.revenue) || 0,
      revenue_text: formatMoney(row.revenue || 0)
    }));
}

function normalizeAnalyticsDate(value) {
  const normalized = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : "";
}

// 旧 Excel 销售记录只用于营收分析，不与真实订单或用户关联。
function getHistoricalSales({ from, to } = {}) {
  const clauses = [];
  const params = [];
  const dateFrom = normalizeAnalyticsDate(from);
  const dateTo = normalizeAnalyticsDate(to);

  if (dateFrom) {
    clauses.push("sale_date >= ?");
    params.push(dateFrom);
  }
  if (dateTo) {
    clauses.push("sale_date <= ?");
    params.push(dateTo);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return db
    .prepare(`
      SELECT id, sale_date, product_name, total_amount, quantity, source_file, source_sheet, source_row
      FROM historical_sales
      ${where}
      ORDER BY sale_date ASC, source_row ASC, id ASC
    `)
    .all(...params)
    .map((row) => ({
      id: row.id,
      sale_date: row.sale_date,
      product_name: row.product_name,
      total_amount: Number(row.total_amount) || 0,
      quantity: Math.max(0, Number(row.quantity) || 0),
      source_file: row.source_file,
      source_sheet: row.source_sheet,
      source_row: Number(row.source_row) || 0
    }));
}

function getAdminStats() {
  const totals = db
    .prepare(`
      SELECT
        SUM(CASE WHEN status != 'cancelled' THEN 1 ELSE 0 END) AS order_count,
        COALESCE(SUM(CASE WHEN status NOT IN ('cancelled', 'activity') AND COALESCE(payment_status, 'non_paid') = 'paid' THEN total_amount ELSE 0 END), 0) AS total_revenue
      FROM orders
    `)
    .get();
  const users = db.prepare("SELECT COUNT(*) AS user_count FROM users").get();
  const byStatus = db
    .prepare(`
      SELECT status, COUNT(*) AS count
      FROM orders
      GROUP BY status
      ORDER BY status ASC
    `)
    .all();
  const topProducts = db
    .prepare(`
      SELECT p.id, p.name, SUM(oi.quantity) AS quantity, SUM(oi.subtotal) AS revenue
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status NOT IN ('cancelled', 'activity')
        AND COALESCE(o.payment_status, 'non_paid') = 'paid'
      GROUP BY p.id, p.name
      ORDER BY quantity DESC
      LIMIT 10
    `)
    .all();

  return {
    order_count: totals.order_count || 0,
    total_revenue: totals.total_revenue || 0,
    total_revenue_text: formatMoney(totals.total_revenue || 0),
    user_count: users.user_count || 0,
    by_status: byStatus,
    top_products: topProducts
  };
}

function getUnseenOrderCount() {
  const row = db
    .prepare("SELECT COUNT(*) AS count FROM orders WHERE admin_seen_at IS NULL")
    .get();
  return Number(row && row.count) || 0;
}

function markAllOrdersSeen() {
  const result = db
    .prepare("UPDATE orders SET admin_seen_at = CURRENT_TIMESTAMP WHERE admin_seen_at IS NULL")
    .run();
  return {
    updated: Number(result && result.changes) || 0,
    count: getUnseenOrderCount()
  };
}

function markOrderSeen(orderId) {
  const id = Number(orderId);
  if (!id) throw makeHttpError(400, "订单 ID 不正确");
  const result = db
    .prepare("UPDATE orders SET admin_seen_at = CURRENT_TIMESTAMP WHERE id = ? AND admin_seen_at IS NULL")
    .run(id);
  return {
    updated: Number(result && result.changes) || 0,
    count: getUnseenOrderCount(),
    order: getOrderById(id)
  };
}

module.exports = {
  createOrder,
  createManualHistoricalOrder,
  getManualOrderGroups,
  updateManualOrderGroup,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  getOrdersGroupedByUser,
  getOrdersGroupedByGroupId,
  updateOrderStatus,
  updateOrderPayment,
  updateOrderComment,
  cancelOrder,
  sweepUnpaidOrders,
  updateOrderDetails,
  getWeeklySalesAnalytics,
  getMemberAnalytics,
  getMembersForAdmin,
  updateUserTag,
  updateUserProfile,
  getProductAnalytics,
  getPickupAnalytics,
  getHistoricalSales,
  getAdminStats,
  getUnseenOrderCount,
  markAllOrdersSeen,
  markOrderSeen
};
