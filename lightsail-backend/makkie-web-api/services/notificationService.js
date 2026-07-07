const https = require("https");
const { db } = require("../db");

const REMINDABLE_STATUSES = ["pending", "paid", "making", "ready"];
let cachedAccessToken = null;
let accessTokenExpiresAt = 0;

function makeHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizePickupKey(value) {
  const key = String(value || "").toLowerCase().replace(/[\s_-]+/g, "");
  if (key.includes("irvine") || key.includes("尔湾")) return "irvine";
  if (key.includes("losangeles") || key.includes("la") || key.includes("洛杉矶")) return "los_angeles";
  return "";
}

function getPickupMatcher(pickupKey) {
  const key = normalizePickupKey(pickupKey);
  if (key === "irvine") {
    return {
      key,
      label: "Irvine",
      pattern: "%irvine%"
    };
  }
  if (key === "los_angeles") {
    return {
      key,
      label: "Los Angeles",
      pattern: "%los angeles%"
    };
  }
  throw makeHttpError(400, "取货点不正确");
}

function formatMoney(amount) {
  const normalized = Math.round((Number(amount) || 0) * 100) / 100;
  return Number.isInteger(normalized) ? `$${normalized}` : `$${normalized.toFixed(2)}`;
}

function getPickupReminderTargets(pickupKey) {
  const matcher = getPickupMatcher(pickupKey);
  const statusPlaceholders = REMINDABLE_STATUSES.map(() => "?").join(",");
  const rows = db
    .prepare(`
      SELECT
        u.id AS user_id,
        u.openid,
        u.nickname,
        COALESCE(u.notification_enabled, 1) AS notification_enabled,
        p.id AS pickup_location_id,
        p.name AS pickup_name,
        p.address AS pickup_address,
        COUNT(o.id) AS order_count,
        COALESCE(SUM(o.total_amount), 0) AS total_amount,
        GROUP_CONCAT(o.id) AS order_ids,
        MAX(o.pickup_time) AS pickup_time
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN pickup_locations p ON p.id = o.pickup_location_id
      WHERE lower(p.name) LIKE ?
        AND o.status IN (${statusPlaceholders})
      GROUP BY u.id, p.id
      ORDER BY u.id ASC
    `)
    .all(matcher.pattern, ...REMINDABLE_STATUSES);

  const targets = rows.map((row) => ({
    user_id: row.user_id,
    openid: row.openid || "",
    nickname: row.nickname || "微信用户",
    notification_enabled: Number(row.notification_enabled) ? 1 : 0,
    pickup_location_id: row.pickup_location_id,
    pickup_name: row.pickup_name || matcher.label,
    pickup_address: row.pickup_address || "",
    order_count: row.order_count || 0,
    total_amount: Number(row.total_amount) || 0,
    total_text: formatMoney(row.total_amount || 0),
    order_ids: row.order_ids ? String(row.order_ids).split(",").map(Number) : [],
    pickup_time: row.pickup_time || ""
  }));

  return {
    pickup: matcher,
    targets,
    summary: summarizeTargets(targets)
  };
}

function summarizeTargets(targets) {
  const enabledTargets = targets.filter((target) => target.notification_enabled);
  const disabledTargets = targets.filter((target) => !target.notification_enabled);
  const localOpenidTargets = enabledTargets.filter((target) => !isRealWechatOpenid(target.openid));

  return {
    total_users: targets.length,
    enabled_users: enabledTargets.length,
    disabled_users: disabledTargets.length,
    local_openid_users: localOpenidTargets.length,
    order_count: targets.reduce((sum, target) => sum + (target.order_count || 0), 0)
  };
}

function getAllPickupReminderTargetSummaries() {
  const irvine = getPickupReminderTargets("irvine");
  const losAngeles = getPickupReminderTargets("los_angeles");

  return {
    irvine: {
      pickup: irvine.pickup,
      summary: irvine.summary
    },
    los_angeles: {
      pickup: losAngeles.pickup,
      summary: losAngeles.summary
    }
  };
}

function isRealWechatOpenid(openid) {
  return Boolean(openid && !String(openid).startsWith("local:"));
}

function httpsJson(method, url, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : "";
    const request = https.request(url, {
      method,
      headers: {
        "content-type": "application/json",
        "content-length": Buffer.byteLength(payload)
      }
    }, (response) => {
      let raw = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        raw += chunk;
      });
      response.on("end", () => {
        try {
          resolve(raw ? JSON.parse(raw) : {});
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on("error", reject);
    if (payload) request.write(payload);
    request.end();
  });
}

async function getWechatAccessToken() {
  const appid = process.env.WECHAT_APPID || process.env.WX_APPID;
  const secret = process.env.WECHAT_SECRET || process.env.WX_SECRET;
  if (!appid || !secret) return "";

  if (cachedAccessToken && Date.now() < accessTokenExpiresAt) {
    return cachedAccessToken;
  }

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(appid)}&secret=${encodeURIComponent(secret)}`;
  const payload = await httpsJson("GET", url);
  if (!payload.access_token) {
    throw makeHttpError(502, payload.errmsg || "微信 access_token 获取失败");
  }

  cachedAccessToken = payload.access_token;
  accessTokenExpiresAt = Date.now() + Math.max((Number(payload.expires_in) || 7200) - 300, 60) * 1000;
  return cachedAccessToken;
}

function buildTemplateData(target) {
  return {
    thing1: { value: "Makkie Mua 取货提醒" },
    thing2: { value: target.pickup_name || "Pickup" },
    thing3: { value: target.pickup_time || "请查看订单页" },
    thing4: { value: `${target.order_count} 单待取货` }
  };
}

async function sendWechatPickupReminder(target) {
  const templateId = process.env.WECHAT_PICKUP_REMINDER_TEMPLATE_ID || process.env.WX_PICKUP_REMINDER_TEMPLATE_ID;
  if (!templateId) {
    return {
      ok: false,
      skipped: true,
      reason: "not_configured",
      message: "未配置微信订阅消息模板"
    };
  }

  const accessToken = await getWechatAccessToken();
  if (!accessToken) {
    return {
      ok: false,
      skipped: true,
      reason: "not_configured",
      message: "未配置微信 AppID/Secret"
    };
  }

  const payload = {
    touser: target.openid,
    template_id: templateId,
    page: process.env.WECHAT_PICKUP_REMINDER_PAGE || "pages/orders/orders",
    miniprogram_state: process.env.WECHAT_MINIPROGRAM_STATE || "trial",
    lang: "zh_CN",
    data: buildTemplateData(target)
  };
  const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${encodeURIComponent(accessToken)}`;
  const result = await httpsJson("POST", url, payload);

  if (result.errcode && result.errcode !== 0) {
    return {
      ok: false,
      reason: String(result.errcode),
      message: result.errmsg || "发送失败"
    };
  }

  return {
    ok: true,
    message: "sent"
  };
}

async function sendPickupReminder(pickupKey) {
  const targetPayload = getPickupReminderTargets(pickupKey);
  const results = [];

  for (const target of targetPayload.targets) {
    if (!target.notification_enabled) {
      results.push({
        user_id: target.user_id,
        nickname: target.nickname,
        ok: false,
        skipped: true,
        reason: "disabled",
        message: "用户已关闭通知"
      });
      continue;
    }

    if (!isRealWechatOpenid(target.openid)) {
      results.push({
        user_id: target.user_id,
        nickname: target.nickname,
        ok: false,
        skipped: true,
        reason: "local_openid",
        message: "当前账号没有真实微信 openid"
      });
      continue;
    }

    try {
      const result = await sendWechatPickupReminder(target);
      results.push({
        user_id: target.user_id,
        nickname: target.nickname,
        ...result
      });
    } catch (error) {
      results.push({
        user_id: target.user_id,
        nickname: target.nickname,
        ok: false,
        reason: "error",
        message: error.message || "发送失败"
      });
    }
  }

  return {
    pickup: targetPayload.pickup,
    summary: {
      ...targetPayload.summary,
      sent_count: results.filter((item) => item.ok).length,
      skipped_count: results.filter((item) => item.skipped).length,
      failed_count: results.filter((item) => !item.ok && !item.skipped).length
    },
    results
  };
}

module.exports = {
  getAllPickupReminderTargetSummaries,
  sendPickupReminder
};
