const { db } = require("../db");
const {
  ADMIN_DISPLAY_NAME,
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  createAdminToken,
  createToken,
  isAdminUser
} = require("../middleware/auth");

function formatAccountId(userId) {
  return `M${String(userId).padStart(6, "0")}`;
}

function normalizeUser(user) {
  const loginType = user.login_type || (String(user.openid || "").startsWith("google:") ? "google" : "guest");
  return {
    id: user.id,
    uuid: formatAccountId(user.id),
    openid: user.openid,
    nickname: user.nickname,
    avatar_url: user.avatar_url,
    phone: user.phone,
    email: user.email || "",
    name: user.name || user.nickname || "",
    picture: user.picture || user.avatar_url || "",
    login_type: loginType,
    order_count: user.order_count || 0,
    total_spent: user.total_spent || 0,
    last_order_at: user.last_order_at,
    created_at: user.created_at,
    isAdmin: isAdminUser(user),
    profile: {
      nickname: user.nickname || "微信用户",
      avatarUrl: user.picture || user.avatar_url || ""
    }
  };
}

function normalizeAdminUser() {
  return {
    id: "web-admin",
    username: ADMIN_USERNAME,
    nickname: ADMIN_DISPLAY_NAME,
    isAdmin: true,
    is_admin: true,
    profile: {
      nickname: ADMIN_DISPLAY_NAME,
      avatarUrl: ""
    }
  };
}

function getUserById(userId) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
}

function getUserByClientId(clientId) {
  if (!clientId) return null;
  return db.prepare("SELECT * FROM users WHERE openid = ?").get(`local:${clientId}`);
}

function upsertLocalUser({ clientId, profile }) {
  const openid = `local:${clientId}`;
  const existing = db.prepare("SELECT * FROM users WHERE openid = ?").get(openid);
  const nickname = profile && profile.nickname ? profile.nickname : "微信用户";
  const avatarUrl = profile && profile.avatarUrl ? profile.avatarUrl : "";

  if (!existing) {
    const result = db
      .prepare(`
        INSERT INTO users (openid, nickname, avatar_url, phone, order_count, total_spent, created_at)
        VALUES (?, ?, ?, '', 0, 0, CURRENT_TIMESTAMP)
      `)
      .run(openid, nickname, avatarUrl);

    return getUserById(result.lastInsertRowid);
  }

  db
    .prepare(`
      UPDATE users
      SET nickname = COALESCE(NULLIF(?, ''), nickname),
          avatar_url = COALESCE(NULLIF(?, ''), avatar_url)
      WHERE id = ?
    `)
    .run(nickname, avatarUrl, existing.id);

  return getUserById(existing.id);
}

function localCheck({ client_id }) {
  const user = getUserByClientId(client_id);
  if (!user) {
    return {
      token: "",
      user: null
    };
  }

  return {
    token: createToken(user.id),
    user: normalizeUser(user)
  };
}

function localLogin({ client_id, profile }) {
  if (!client_id) {
    const error = new Error("缺少 client_id");
    error.status = 400;
    throw error;
  }

  if (!profile || !profile.nickname) {
    const error = new Error("请输入昵称");
    error.status = 400;
    throw error;
  }

  const user = upsertLocalUser({
    clientId: client_id,
    profile
  });

  return {
    token: createToken(user.id),
    user: normalizeUser(user)
  };
}

function updateUserProfile(userId, profile) {
  const existing = getUserById(userId);
  if (!existing) return null;

  db
    .prepare(`
      UPDATE users
      SET nickname = COALESCE(NULLIF(?, ''), nickname),
          avatar_url = COALESCE(NULLIF(?, ''), avatar_url)
      WHERE id = ?
    `)
    .run(
      profile && profile.nickname ? profile.nickname : "",
      profile && profile.avatarUrl ? profile.avatarUrl : "",
      userId
    );

  return getUserById(userId);
}

// --- Google 登录（Google Identity Services ID token credential）---
async function googleLogin({ credential }) {
  if (!credential) {
    const error = new Error("缺少 Google credential");
    error.status = 400;
    throw error;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  if (!clientId || clientId.startsWith("REPLACE")) {
    const error = new Error("服务器未配置 GOOGLE_CLIENT_ID");
    error.status = 500;
    throw error;
  }

  const { OAuth2Client } = require("google-auth-library");
  const client = new OAuth2Client(clientId);
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    payload = ticket.getPayload();
  } catch (verifyError) {
    const error = new Error("Google 登录校验失败");
    error.status = 401;
    throw error;
  }

  const googleId = payload.sub;
  const email = payload.email || "";
  const name = payload.name || email || "Google 用户";
  const picture = payload.picture || "";
  const openid = `google:${googleId}`;

  const existing = db.prepare("SELECT * FROM users WHERE openid = ? OR google_id = ?").get(openid, googleId);

  if (!existing) {
    const result = db
      .prepare(`
        INSERT INTO users (openid, google_id, email, name, picture, nickname, avatar_url, phone,
                           login_type, order_count, total_spent, created_at, last_login_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, '', 'google', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
      .run(openid, googleId, email, name, picture, name, picture);
    const user = getUserById(result.lastInsertRowid);
    return { token: createToken(user.id), user: normalizeUser(user) };
  }

  db
    .prepare(`
      UPDATE users
      SET google_id = ?, email = ?, name = ?, picture = ?,
          nickname = COALESCE(NULLIF(nickname, ''), ?),
          login_type = 'google', last_login_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(googleId, email, name, picture, name, existing.id);

  const user = getUserById(existing.id);
  return { token: createToken(user.id), user: normalizeUser(user) };
}

// --- 游客昵称登录（不需要 Google）---
function guestLogin({ nickname, client_id }) {
  const trimmed = String(nickname || "").trim();
  if (!trimmed) {
    const error = new Error("请输入昵称");
    error.status = 400;
    throw error;
  }
  if (trimmed.length > 30) {
    const error = new Error("昵称最多 30 个字符");
    error.status = 400;
    throw error;
  }

  // 复用浏览器的 client_id：同一浏览器的游客身份（和历史订单）保持不变。
  const clientId = String(client_id || "").trim()
    || `guest_${Date.now()}_${require("crypto").randomBytes(4).toString("hex")}`;

  const user = upsertLocalUser({ clientId, profile: { nickname: trimmed } });
  db
    .prepare("UPDATE users SET name = ?, login_type = 'guest', last_login_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(trimmed, user.id);

  const fresh = getUserById(user.id);
  return { token: createToken(fresh.id), user: normalizeUser(fresh) };
}

function adminLogin({ username, password }) {
  if (!username || !password) {
    const error = new Error("请输入管理员账号和密码");
    error.status = 400;
    throw error;
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    const error = new Error("管理员账号或密码不正确");
    error.status = 401;
    throw error;
  }

  return {
    token: createAdminToken(username),
    user: normalizeAdminUser()
  };
}

module.exports = {
  adminLogin,
  formatAccountId,
  googleLogin,
  guestLogin,
  normalizeAdminUser,
  normalizeUser,
  localCheck,
  localLogin,
  updateUserProfile
};
