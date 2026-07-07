const https = require("https");

let warnedMissingEnv = false;

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(amount) {
  const normalized = Math.round((Number(amount) || 0) * 100) / 100;
  return Number.isInteger(normalized) ? `$${normalized}` : `$${normalized.toFixed(2)}`;
}

function compact(value, fallback = "无") {
  const text = String(value == null ? "" : value).trim();
  return text || fallback;
}

function getAdminOrderUrl(orderId) {
  const base = process.env.ADMIN_BASE_URL || "https://admin.makkiemua.com/";
  try {
    return new URL(`admin/orders/${encodeURIComponent(orderId)}`, base.endsWith("/") ? base : `${base}/`).toString();
  } catch (error) {
    return `${base.replace(/\/+$/, "")}/admin/orders/${encodeURIComponent(orderId)}`;
  }
}

function getPickupName(order) {
  return compact(
    order.pickup_location_name
      || order.pickup_name
      || (order.pickup && (order.pickup.name || order.pickup.label))
      || order.pickupLocationName,
    "未记录"
  );
}

function getCustomerName(order) {
  return compact(
    order.customer_name
      || order.userNickname
      || order.user_nickname
      || order.nickname
      || (order.user && (order.user.nickname || order.user.name)),
    "未记录"
  );
}

function formatItems(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  if (!items.length) return "- 无商品明细";

  return items.map((item) => {
    const name = compact(item.title || item.name || item.product_name || item.productName || `商品 ${item.product_id || ""}`, "未命名商品");
    const quantity = Number(item.quantity) || 0;
    return `- ${escapeHtml(name)} x${escapeHtml(quantity)}`;
  }).join("\n");
}

function buildMessage(order) {
  const orderId = order.id || order.uuid || order.order_id || "";
  const groupNumber = compact(
    order.group_id
      || order.groupId
      || order.weekly_order_number
      || order.weeklyOrderNumber
      || order.weekly_order_id,
    "未记录"
  );
  const orderNumber = compact(
    order.group_order_number
      || order.groupOrderNumber
      || order.orderNumber
      || order.order_no
      || orderId,
    "未记录"
  );
  const note = compact(order.note || order.notes || order.comment || order.order_note, "无");
  const total = order.total && order.total.text
    ? order.total.text
    : formatMoney(order.total_amount || order.subtotal || order.total);

  return [
    "🍰 <b>Makkie Mua 新订单</b>",
    "",
    `团购编号：${escapeHtml(groupNumber)}`,
    `订单号：#${escapeHtml(orderNumber)}`,
    `客户：${escapeHtml(getCustomerName(order))}`,
    `取货点：${escapeHtml(getPickupName(order))}`,
    `备注：${escapeHtml(note)}`,
    "",
    "商品：",
    formatItems(order),
    "",
    `总金额：${escapeHtml(total)}`,
    `备注：${escapeHtml(note)}`,
    "",
    `后台查看：${escapeHtml(getAdminOrderUrl(orderId || orderNumber))}`
  ].join("\n");
}

function postTelegramMessage(token, payload) {
  const body = JSON.stringify(payload);
  const url = new URL(`https://api.telegram.org/bot${token}/sendMessage`);

  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body)
        },
        timeout: 12000
      },
      (response) => {
        let data = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          let parsed = null;
          try {
            parsed = data ? JSON.parse(data) : null;
          } catch (error) {
            parsed = null;
          }

          if (response.statusCode < 200 || response.statusCode >= 300 || (parsed && parsed.ok === false)) {
            reject(new Error(`Telegram API failed (${response.statusCode}): ${data || "empty response"}`));
            return;
          }

          resolve(parsed || {});
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error("Telegram API request timed out"));
    });
    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

async function notifyNewOrder(order) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    if (!warnedMissingEnv) {
      warnedMissingEnv = true;
      console.warn("[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing; new order notifications skipped.");
    }
    return { skipped: true };
  }

  try {
    const result = await postTelegramMessage(token, {
      chat_id: chatId,
      text: buildMessage(order || {}),
      parse_mode: "HTML",
      disable_web_page_preview: true
    });
    console.log(`[telegram] New order notification sent for order ${order && order.id ? order.id : "unknown"}.`);
    return result;
  } catch (error) {
    console.error("[telegram] New order notification failed:", error);
    throw error;
  }
}

module.exports = {
  notifyNewOrder
};
