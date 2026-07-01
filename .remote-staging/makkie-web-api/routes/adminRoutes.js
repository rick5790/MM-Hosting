const router = require("express").Router();
const adminController = require("../controllers/adminController");
const { requireAdmin } = require("../middleware/auth");
const { productImageUpload, collectionImageUpload } = require("../middleware/upload");

router.post("/login", adminController.login);
router.get("/orders", requireAdmin, adminController.orders);
router.get("/orders/:id", requireAdmin, adminController.orderDetail);
router.patch("/orders/:id/status", requireAdmin, adminController.updateOrderStatus);
router.patch("/orders/:id/payment", requireAdmin, adminController.updateOrderPayment);
router.patch("/orders/:id/comment", requireAdmin, adminController.updateOrderComment);
router.get("/stats", requireAdmin, adminController.stats);
router.get("/analytics/weekly-sales", requireAdmin, adminController.weeklySalesAnalytics);
router.get("/analytics/members", requireAdmin, adminController.memberAnalytics);
router.get("/analytics/by-product", requireAdmin, adminController.productAnalytics);
router.get("/analytics/by-pickup", requireAdmin, adminController.pickupAnalytics);
router.get("/pickup-locations", requireAdmin, adminController.pickupLocations);
router.patch("/pickup-locations/:id", requireAdmin, adminController.savePickupLocation);
router.get("/weekly-order", requireAdmin, adminController.weeklyOrder);
router.patch("/weekly-order", requireAdmin, adminController.saveWeeklyOrder);
router.get("/notifications/pickup-reminders", requireAdmin, adminController.pickupReminderTargets);
router.post("/notifications/pickup-reminders/:pickup", requireAdmin, adminController.sendPickupReminderNotice);
router.get("/products", requireAdmin, adminController.products);
router.post("/products", requireAdmin, adminController.addProduct);
router.patch("/products/:id", requireAdmin, adminController.saveProduct);
router.delete("/products/:id", requireAdmin, adminController.removeProduct);
router.post(
  "/products/:id/image",
  requireAdmin,
  productImageUpload.single("image"),
  adminController.uploadProductImage
);
router.post(
  "/collection-images/:fileName",
  requireAdmin,
  collectionImageUpload.single("image"),
  adminController.uploadCollectionImage
);

module.exports = router;
