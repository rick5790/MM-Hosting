const router = require("express").Router();
const pickupController = require("../controllers/pickupController");

router.get("/", pickupController.index);

module.exports = router;
