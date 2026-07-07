const {
  adminLogin,
  googleLogin,
  guestLogin,
  localCheck,
  localLogin,
  normalizeUser,
  updateUserProfile
} = require("../services/authService");
const { AUTH_COOKIE_NAME } = require("../middleware/auth");

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
}

function check(req, res, next) {
  try {
    res.json({
      ok: true,
      data: localCheck(req.body || {})
    });
  } catch (error) {
    next(error);
  }
}

function login(req, res, next) {
  try {
    res.json({
      ok: true,
      data: localLogin(req.body || {})
    });
  } catch (error) {
    next(error);
  }
}

function admin(req, res, next) {
  try {
    res.json({
      ok: true,
      data: adminLogin(req.body || {})
    });
  } catch (error) {
    next(error);
  }
}

function profile(req, res, next) {
  try {
    const user = updateUserProfile(req.user.id, req.body || {});
    res.json({
      ok: true,
      data: {
        token: req.headers.authorization.replace(/^Bearer\s+/i, ""),
        user: normalizeUser(user)
      }
    });
  } catch (error) {
    next(error);
  }
}

async function google(req, res, next) {
  try {
    const result = await googleLogin(req.body || {});
    setAuthCookie(res, result.token);
    res.json({
      ok: true,
      data: result,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
}

function guest(req, res, next) {
  try {
    const result = guestLogin(req.body || {});
    setAuthCookie(res, result.token);
    res.json({
      ok: true,
      data: result,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/me — requireLogin 已经把 req.user 填好（Bearer 或 cookie 都行）
function me(req, res) {
  res.json({
    ok: true,
    data: { user: normalizeUser(req.user) },
    user: normalizeUser(req.user)
  });
}

function logout(req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, { httpOnly: true, secure: true, sameSite: "lax" });
  res.json({ ok: true });
}

function avatar(req, res, next) {
  try {
    if (!req.file) {
      res.status(400).json({
        ok: false,
        message: "请选择头像"
      });
      return;
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = updateUserProfile(req.user.id, {
      avatarUrl
    });

    res.json({
      ok: true,
      data: {
        avatar_url: avatarUrl,
        token: req.headers.authorization.replace(/^Bearer\s+/i, ""),
        user: normalizeUser(user)
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  admin,
  check,
  login,
  google,
  guest,
  me,
  logout,
  profile,
  avatar
};
