const {
  adminLogin,
  localCheck,
  localLogin,
  normalizeUser,
  updateUserProfile
} = require("../services/authService");

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
  profile,
  avatar
};
