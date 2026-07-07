const { listPickupLocations } = require("../services/pickupService");

function index(req, res) {
  res.json({
    ok: true,
    data: {
      pickup_locations: listPickupLocations()
    }
  });
}

module.exports = {
  index
};
