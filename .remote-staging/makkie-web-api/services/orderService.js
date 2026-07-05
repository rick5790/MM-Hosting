const { db } = require("../db");
const { formatAccountId } = require("./authService");
const {
  getActiveGroupId,
  getWeeklyOrderAvailability
} = require("./weeklyOrderService");

const VALID_STATUSES = ["pending", "paid", "making", "ready", "completed", "cancelled"];
const VALID_PAYMENT_STATUSES = ["non_paid", "paid", "refunded"];
const VALID_PAYMENT_METHODS = ["cash", "venmo", "zelle", "alipay"];

function formatMoney(amount) {
  const normalized = Math.round((Number(amount) || 0) * 100) / 100;
  return Number.isInteger(normalized) ? `$${normalized}` : `$${normalized.toFixed(2)}`;
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
        oi.quantity,
        oi.unit_price,
        oi.subtotal,
        p.name,
        p.image_url
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC
    `)
    .all(orderId);
}

function decorateOrder(order) {
  if (!order) return null;

  const groupOrderNumber = Number(order.group_order_number) || null;
  const paymentStatus = VALID_PAYMENT_STATUSES.includes(String(order.payment_status || ""))
    ? String(order.payment_status)
    : "non_paid";
  const paymentMethod = String(order.payment_method || "");
  const items = getOrderItems(order.id).map((item) => ({
    id: String(item.product_id),
    product_id: item.product_id,
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
    total_amount: order.total_amount,
    total: {
      amount: order.total_amount,
      text: formatMoney(order.total_amount),
      currency: "USD"
    },
    status: order.status,
    notes: order.notes,
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
  const cartItems = Array.isArray(body.cart_items)
    ? body.cart_items
    : (Array.isArray(body.items) ? body.items : []);

  if (!pickupLocationId) throw makeHttpError(400, "缺少 pickup_location_id");
  if (!cartItems.length) throw makeHttpError(400, "购物车为空");

  const pickupLocation = db
    .prepare("SELECT * FROM pickup_locations WHERE id = ? AND is_active = 1")
    .get(pickupLocationId);
  if (!pickupLocation) throw makeHttpError(400, "取货点不存在");

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

      const unitPrice = Number(product.price) || 0;
      return {
        product,
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        subtotal: unitPrice * quantity
      };
    });

    const totalAmount = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const groupId = weeklyAvailability.weeklyOrder && weeklyAvailability.weeklyOrder.active_group_id
      ? String(weeklyAvailability.weeklyOrder.active_group_id)
      : getActiveGroupId();
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
          status,
          notes,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
        body.notes || body.note || ""
      );

    const orderId = orderResult.lastInsertRowid;
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `);
    const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

    normalizedItems.forEach((item) => {
      insertItem.run(orderId, item.product_id, item.quantity, item.unit_price, item.subtotal);
      updateStock.run(item.quantity, item.product_id);
    });

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
  return decorateOrder(getOrderHeader(orderId));
}

function getOrderById(orderId) {
  return decorateOrder(getOrderHeader(orderId));
}

function getOrdersByUser(userId) {
  return db
    .prepare(`
      SELECT id
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC, id DESC
    `)
    .all(userId)
    .map((row) => getOrderById(row.id));
}

function getAllOrders() {
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
    if (status !== "cancelled") group.totalAmount += Number(order.total_amount) || 0;
    if (status === "completed") group.completedCount += 1;
    if (status !== "completed" && status !== "cancelled") group.pendingCount += 1;

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
  const wasCancelled = order.status === "cancelled";
  const willBeCancelled = nextStatus === "cancelled";
  if (wasCancelled === willBeCancelled) return;

  const items = getOrderItems(order.id);

  if (willBeCancelled) {
    const restoreStock = db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
    items.forEach((item) => {
      restoreStock.run(item.quantity, item.product_id);
    });

    db
      .prepare(`
        UPDATE users
        SET order_count = MAX(COALESCE(order_count, 0) - 1, 0),
            total_spent = MAX(COALESCE(total_spent, 0) - ?, 0)
        WHERE id = ?
      `)
      .run(order.total_amount || 0, order.user_id);
    return;
  }

  const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
  items.forEach((item) => {
    const product = db.prepare("SELECT name, stock FROM products WHERE id = ?").get(item.product_id);
    if (!product) throw makeHttpError(400, "商品不存在");
    if (Number(product.stock) < Number(item.quantity)) {
      throw makeHttpError(409, `${product.name} 库存不足，无法恢复订单`);
    }
    updateStock.run(item.quantity, item.product_id);
  });

  db
    .prepare(`
      UPDATE users
      SET order_count = COALESCE(order_count, 0) + 1,
          total_spent = COALESCE(total_spent, 0) + ?
      WHERE id = ?
    `)
    .run(order.total_amount || 0, order.user_id);
}

function updateOrderStatus(orderId, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw makeHttpError(400, "订单状态不正确");
  }

  const current = getOrderHeader(orderId);
  if (!current) throw makeHttpError(404, "订单不存在");

  const tx = db.transaction(() => {
    applyOrderTotalsForStatusChange(current, status);
    db
      .prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(status, orderId);
  });

  tx();
  return getOrderById(orderId);
}

function cancelOrder(orderId, user) {
  const current = getOrderHeader(orderId);
  if (!current) throw makeHttpError(404, "订单不存在");

  if (Number(current.user_id) !== Number(user.id)) {
    throw makeHttpError(403, "不能取消别人的订单");
  }

  if (current.status !== "pending") {
    throw makeHttpError(409, "当前状态不可取消");
  }

  const weeklyAvailability = getWeeklyOrderAvailability();
  if (!weeklyAvailability.accepting) {
    throw makeHttpError(409, "已截单不可取消");
  }

  const tx = db.transaction(() => {
    applyOrderTotalsForStatusChange(current, "cancelled");

    const result = db
      .prepare("UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'")
      .run(orderId);

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
      .prepare("UPDATE orders SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(nextStatus, nextNotes, orderId);
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
      WHERE status != 'cancelled'
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
      WHERE o.status != 'cancelled'
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
      WHERE o.status != 'cancelled'
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

function getAdminStats() {
  const totals = db
    .prepare(`
      SELECT
        COUNT(*) AS order_count,
        COALESCE(SUM(total_amount), 0) AS total_revenue
      FROM orders
      WHERE status != 'cancelled'
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
      WHERE o.status != 'cancelled'
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

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  getOrdersGroupedByUser,
  getOrdersGroupedByGroupId,
  updateOrderStatus,
  updateOrderPayment,
  updateOrderComment,
  cancelOrder,
  updateOrderDetails,
  getWeeklySalesAnalytics,
  getMemberAnalytics,
  getProductAnalytics,
  getPickupAnalytics,
  getAdminStats
};
