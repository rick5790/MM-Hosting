const crypto = require("crypto");
const { db } = require("../db");

const TOKEN_SECRET = process.env.TOKEN_SECRET || "makkie-mua-dev-secret";
const ADMIN_USERNAME = process.env.MAKKIE_ADMIN_USERNAME || "makkie-admin";
const ADMIN_PASSWORD = process.env.MAKKIE_ADMIN_PASSWORD || "ChangeMakkie2026!";
const ADMIN_DISPLAY_NAME = process.env.MAKKIE_ADMIN_DISPLAY_NAME || "Makkie Admin";
const ADMIN_OPENIDS = (process.env.ADMIN_OPENIDS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "")
  .split(",")
  .map((item) => Number(item.trim()))
  .filter(Boolean);

function signUserId(userId) {
  return crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(String(userId))
    .digest("hex");
}

function createToken(userId) {
  return `${userId}.${signUserId(userId)}`;
}

function signAdminUsername(username) {
  return crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(`admin:${username}`)
    .digest("hex");
}

function createAdminToken(username = ADMIN_USERNAME) {
  return `admin.${username}.${signAdminUsername(username)}`;
}

function verifyToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2) return null;

  const userId = Number(parts[0]);
  const signature = parts[1];
  if (!userId || signature !== signUserId(userId)) return null;

  return userId;
}

function verifyAdminToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3 || parts[0] !== "admin") return null;

  const username = parts[1];
  const signature = parts[2];
  if (!username || signature !== signAdminUsername(username)) return null;
  if (username !== ADMIN_USERNAME) return null;

  return {
    username,
    display_name: ADMIN_DISPLAY_NAME
  };
}

const AUTH_COOKIE_NAME = "makkie_token";

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (match) return match[1];
  // Fallback: httpOnly cookie set by /api/auth/google and /api/auth/guest.
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) return req.cookies[AUTH_COOKIE_NAME];
  return "";
}

function isAdminUser(user) {
  if (!user) return false;
  return ADMIN_USER_IDS.includes(Number(user.id)) || ADMIN_OPENIDS.includes(user.openid);
}

function requireAuth(req, res, next) {
  const userId = verifyToken(getBearerToken(req));
  if (!userId) {
    res.status(401).json({
      ok: false,
      message: "未登录"
    });
    return;
  }

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  if (!user) {
    res.status(401).json({
      ok: false,
      message: "用户不存在"
    });
    return;
  }

  req.user = user;
  req.isAdmin = isAdminUser(user);
  next();
}

function requireAdmin(req, res, next) {
  const admin = verifyAdminToken(getBearerToken(req));
  if (admin) {
    req.admin = admin;
    req.isAdmin = true;
    next();
    return;
  }

  requireAuth(req, res, () => {
    if (!req.isAdmin) {
      res.status(403).json({
        ok: false,
        message: "当前用户不是管理员"
      });
      return;
    }

    next();
  });
}

// requireLogin: alias of requireAuth for new code. Accepts Bearer token OR the
// makkie_token httpOnly cookie. Existing routes keep working unchanged.
// 以后可以给这些接口加 requireLogin（目前保持原样避免影响现有功能）：
//   - GET  /api/orders/user/:userId （目前 controller 内部自己校验）
//   - PATCH /api/auth/profile      （已经用 requireAuth）
const requireLogin = requireAuth;

module.exports = {
  AUTH_COOKIE_NAME,
  createToken,
  createAdminToken,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  ADMIN_DISPLAY_NAME,
  isAdminUser,
  requireAuth,
  requireLogin,
  requireAdmin,
  verifyAdminToken,
  verifyToken
};
