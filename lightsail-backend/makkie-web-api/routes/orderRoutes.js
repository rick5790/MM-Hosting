const router = require("express").Router();
const orderController = require("../controllers/orderController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.post("/", requireAuth, orderController.create);
router.get("/user/:userId", requireAuth, orderController.userOrders);
router.get("/:id", requireAuth, orderController.show);
router.patch("/:id/cancel", requireAuth, orderController.cancel);
router.patch("/:id", requireAdmin, orderController.update);
router.patch("/:id/status", requireAdmin, orderController.updateStatus);

module.exports = router;
