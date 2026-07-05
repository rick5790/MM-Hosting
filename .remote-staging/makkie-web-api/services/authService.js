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
  return {
    id: user.id,
    uuid: formatAccountId(user.id),
    openid: user.openid,
    nickname: user.nickname,
    avatar_url: user.avatar_url,
    phone: user.phone,
    order_count: user.order_count || 0,
    total_spent: user.total_spent || 0,
    last_order_at: user.last_order_at,
    created_at: user.created_at,
    isAdmin: isAdminUser(user),
    profile: {
      nickname: user.nickname || "微信用户",
      avatarUrl: user.avatar_url || ""
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

function localLogin({ client_id, nickname, profile }) {
  if (!client_id) {
    const error = new Error("缺少 client_id");
    error.status = 400;
    throw error;
  }

  const normalizedProfile = profile && typeof profile === "object"
    ? profile
    : { nickname: String(nickname || "").trim() };

  if (!normalizedProfile || !normalizedProfile.nickname) {
    const error = new Error("请输入昵称");
    error.status = 400;
    throw error;
  }

  const user = upsertLocalUser({
    clientId: client_id,
    profile: normalizedProfile
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
  normalizeAdminUser,
  normalizeUser,
  localCheck,
  localLogin,
  updateUserProfile
};
