const { db } = require("../db");

const DEFAULT_WEEKLY_ORDER = {
  is_open: false,
  group_no: "",
  active_group_id: "",
  title: "",
  start_at: "",
  end_at: "",
  order_deadline_at: ""
};

const GROUP_ID_PATTERN = /^\d{8}$/;

function makeHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function formatGroupNumberDate(date) {
  return `${date.getFullYear()}${padDatePart(date.getMonth() + 1)}${padDatePart(date.getDate())}`;
}

function makeWeeklyOrderNumber(value, fallback = new Date()) {
  const date = value ? new Date(String(value).replace(" ", "T")) : fallback;
  return formatGroupNumberDate(Number.isNaN(date.getTime()) ? fallback : date);
}

function makeDefaultActiveGroupId(date = new Date()) {
  return formatGroupNumberDate(date);
}

function normalizeGroupId(value) {
  return String(value || "").trim();
}

function assertValidGroupId(groupId) {
  if (!groupId) return "";
  if (!GROUP_ID_PATTERN.test(groupId)) {
    throw makeHttpError(400, "团购编号格式应为团购开始日期 YYYYMMDD，例如 20260618");
  }
  return groupId;
}

function getActiveGroupId() {
  const weeklyRow = db.prepare("SELECT value FROM settings WHERE key = ?").get("weekly_order");
  if (weeklyRow) {
    try {
      const weeklyOrder = JSON.parse(weeklyRow.value);
      return makeWeeklyOrderNumber(weeklyOrder && weeklyOrder.start_at);
    } catch (error) {
      return makeDefaultActiveGroupId();
    }
  }

  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get("active_group_id");
  const stored = normalizeGroupId(row && row.value);
  return GROUP_ID_PATTERN.test(stored) ? stored : makeDefaultActiveGroupId();
}

function updateActiveGroupId(value) {
  const groupId = assertValidGroupId(normalizeGroupId(value));
  db
    .prepare(`
      INSERT INTO settings (key, value)
      VALUES ('active_group_id', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `)
    .run(groupId);
  return groupId;
}

// group_no/active_group_id 由 start_at 推导；id 是 admin UI 用来给产品
// 挂 weekly_order_id 的数字形式（同一个 YYYYMMDD）。
function decorateWeeklyOrder(weeklyOrder, activeGroupId) {
  const deadline = weeklyOrder.order_deadline_at || weeklyOrder.end_at || "";
  return {
    ...weeklyOrder,
    group_no: activeGroupId,
    active_group_id: activeGroupId,
    id: Number(activeGroupId) || null,
    order_deadline_at: deadline
  };
}

function getWeeklyOrder() {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get("weekly_order");
  const activeGroupIdRow = db.prepare("SELECT value FROM settings WHERE key = ?").get("active_group_id");
  const storedActiveGroupId = normalizeGroupId(activeGroupIdRow && activeGroupIdRow.value);
  if (!row) {
    const activeGroupId = GROUP_ID_PATTERN.test(storedActiveGroupId) ? storedActiveGroupId : makeDefaultActiveGroupId();
    return decorateWeeklyOrder({ ...DEFAULT_WEEKLY_ORDER }, activeGroupId);
  }

  try {
    const weeklyOrder = {
      ...DEFAULT_WEEKLY_ORDER,
      ...JSON.parse(row.value)
    };
    const activeGroupId = makeWeeklyOrderNumber(weeklyOrder.start_at);
    return decorateWeeklyOrder(weeklyOrder, activeGroupId);
  } catch (error) {
    const activeGroupId = GROUP_ID_PATTERN.test(storedActiveGroupId) ? storedActiveGroupId : makeDefaultActiveGroupId();
    return decorateWeeklyOrder({ ...DEFAULT_WEEKLY_ORDER }, activeGroupId);
  }
}

function persistWeeklyOrder(next) {
  db
    .prepare(`
      INSERT INTO settings (key, value)
      VALUES ('weekly_order', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `)
    .run(JSON.stringify(next));
}

// 截单时间对外叫 order_deadline_at（admin UI 用），同时同步进 end_at，
// 这样 getWeeklyOrderAvailability 和老的消费方逻辑不用改。
function resolveDeadline(payload, fallback) {
  if (payload.order_deadline_at !== undefined) return payload.order_deadline_at || "";
  if (payload.end_at !== undefined) return payload.end_at || "";
  return fallback;
}

function updateWeeklyOrder(payload) {
  const current = getWeeklyOrder();
  const nextStartAt = payload.start_at !== undefined ? (payload.start_at || "") : current.start_at;
  const activeGroupId = updateActiveGroupId(makeWeeklyOrderNumber(nextStartAt));
  const deadline = resolveDeadline(payload, current.order_deadline_at || current.end_at || "");
  const next = {
    is_open: payload.is_open !== undefined ? Boolean(payload.is_open) : current.is_open,
    title: payload.title !== undefined ? String(payload.title || "") : current.title || "",
    start_at: nextStartAt,
    end_at: deadline,
    order_deadline_at: deadline
  };

  persistWeeklyOrder(next);
  return decorateWeeklyOrder(next, activeGroupId);
}

// 创建新团购：不继承旧档期字段，直接以新档期覆盖 weekly_order 设置。
// 新档期的 group_no 改变后，旧订单自动归入历史，旧产品也不再算本周产品。
function createWeeklyOrder(payload) {
  const startAt = payload.start_at || "";
  const activeGroupId = updateActiveGroupId(makeWeeklyOrderNumber(startAt));
  const deadline = resolveDeadline(payload, "");
  const next = {
    is_open: Boolean(payload.is_open),
    title: String(payload.title || ""),
    start_at: startAt,
    end_at: deadline,
    order_deadline_at: deadline
  };

  persistWeeklyOrder(next);
  return decorateWeeklyOrder(next, activeGroupId);
}

function getWeeklyOrderAvailability(now = new Date()) {
  const weeklyOrder = getWeeklyOrder();
  const nowMs = now.getTime();

  if (!weeklyOrder || !weeklyOrder.is_open) {
    return {
      accepting: false,
      reason: "本周预定暂未开放"
    };
  }

  if (weeklyOrder.start_at) {
    const startDate = new Date(weeklyOrder.start_at);
    if (!Number.isNaN(startDate.getTime()) && startDate.getTime() > nowMs) {
      return {
        accepting: false,
        reason: "本周预定还没开始"
      };
    }
  }

  if (weeklyOrder.end_at) {
    const endDate = new Date(weeklyOrder.end_at);
    if (!Number.isNaN(endDate.getTime()) && endDate.getTime() <= nowMs) {
      return {
        accepting: false,
        reason: "本周预定已截止"
      };
    }
  }

  return {
    accepting: true,
    reason: "",
    weeklyOrder: {
      ...weeklyOrder,
      group_no: weeklyOrder.group_no || makeWeeklyOrderNumber(weeklyOrder.start_at)
    }
  };
}

module.exports = {
  getWeeklyOrder,
  updateWeeklyOrder,
  createWeeklyOrder,
  getWeeklyOrderAvailability,
  getActiveGroupId,
  updateActiveGroupId,
  normalizeGroupId,
  assertValidGroupId
};
