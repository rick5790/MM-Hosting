const { getWeeklyOrder } = require("../services/weeklyOrderService");

function show(req, res) {
  res.json({
    ok: true,
    data: {
      weekly_order: getWeeklyOrder()
    }
  });
}

module.exports = {
  show
};
