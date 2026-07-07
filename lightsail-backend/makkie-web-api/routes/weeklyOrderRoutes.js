const router = require("express").Router();
const weeklyOrderController = require("../controllers/weeklyOrderController");

router.get("/", weeklyOrderController.show);

module.exports = router;
