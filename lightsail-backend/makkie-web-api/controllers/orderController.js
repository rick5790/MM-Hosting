const {
  cancelOrder,
  createOrder,
  getOrderById,
  getOrdersByUser,
  updateOrderDetails,
  updateOrderStatus
} = require("../services/orderService");

function create(req, res, next) {
  try {
    const order = createOrder(req.user, req.body || {});
    res.status(201).json({
      ok: true,
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
}

function show(req, res, next) {
  try {
    const order = getOrderById(Number(req.params.id));
    if (!order) {
      res.status(404).json({
        ok: false,
        message: "订单不存在"
      });
      return;
    }

    if (!req.isAdmin && Number(order.user_id) !== Number(req.user.id)) {
      res.status(403).json({
        ok: false,
        message: "无权查看该订单"
      });
      return;
    }

    res.json({
      ok: true,
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
}

function userOrders(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    if (!req.isAdmin && userId !== Number(req.user.id)) {
      res.status(403).json({
        ok: false,
        message: "无权查看该用户订单"
      });
      return;
    }

    res.json({
      ok: true,
      data: {
        isAdmin: req.isAdmin,
        orders: getOrdersByUser(userId)
      }
    });
  } catch (error) {
    next(error);
  }
}

function updateStatus(req, res, next) {
  try {
    const order = updateOrderStatus(Number(req.params.id), req.body.status);
    res.json({
      ok: true,
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    const order = updateOrderDetails(Number(req.params.id), req.body || {});
    res.json({
      ok: true,
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
}

function cancel(req, res, next) {
  try {
    const order = cancelOrder(Number(req.params.id), req.user);
    res.json({
      ok: true,
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  cancel,
  create,
  show,
  userOrders,
  update,
  updateStatus
};
