const router = require("express").Router();
const authController = require("../controllers/authController");
const { requireAuth, requireLogin } = require("../middleware/auth");
const { avatarUpload } = require("../middleware/upload");

router.post("/local-check", authController.check);
router.post("/local-login", authController.login);
router.post("/google", authController.google);
router.post("/guest", authController.guest);
router.get("/me", requireLogin, authController.me);
router.post("/logout", authController.logout);
router.patch("/profile", requireAuth, authController.profile);
router.post("/avatar", requireAuth, avatarUpload.single("avatar"), authController.avatar);

module.exports = router;
