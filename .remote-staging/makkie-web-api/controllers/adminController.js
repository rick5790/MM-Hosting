const {
  adminLogin,
} = require("../services/authService");
const {
  getAllOrders,
  getOrderById,
  getOrdersGroupedByGroupId,
  getOrdersGroupedByUser,
  getAdminStats,
  getWeeklySalesAnalytics,
  getMemberAnalytics,
  getProductAnalytics,
  getPickupAnalytics,
  updateOrderComment,
  updateOrderPayment,
  updateOrderStatus
} = require("../services/orderService");
const {
  listAllProducts,
  createProduct,
  updateProduct,
  updateProductImage,
  deleteProduct
} = require("../services/productService");
const {
  listPickupLocations,
  updatePickupLocation
} = require("../services/pickupService");
const {
  getWeeklyOrder,
  updateWeeklyOrder
} = require("../services/weeklyOrderService");
const {
  getAllPickupReminderTargetSummaries,
  sendPickupReminder
} = require("../services/notificationService");

function login(req, res, next) {
  try {
    res.json({
      ok: true,
      data: adminLogin(req.body || {})
    });
  } catch (error) {
    next(error);
  }
}

function orders(req, res) {
  if (req.query.group === "group_id") {
    res.json({
      ok: true,
      data: {
        isAdmin: true,
        groups: getOrdersGroupedByGroupId()
      }
    });
    return;
  }

  if (req.query.group === "user") {
    res.json({
      ok: true,
      data: {
        isAdmin: true,
        groups: getOrdersGroupedByUser()
      }
    });
    return;
  }

  res.json({
    ok: true,
    data: {
      isAdmin: true,
      orders: getAllOrders()
    }
  });
}

function orderDetail(req, res, next) {
  try {
    const order = getOrderById(Number(req.params.id));
    if (!order) {
      res.status(404).json({
        ok: false,
        message: "订单不存在"
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

function saveOrderStatus(req, res, next) {
  try {
    const order = updateOrderStatus(Number(req.params.id), req.body && req.body.status);
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

function saveOrderPayment(req, res, next) {
  try {
    const order = updateOrderPayment(Number(req.params.id), req.body || {}, req.admin || req.user || null);
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

function saveOrderComment(req, res, next) {
  try {
    const order = updateOrderComment(
      Number(req.params.id),
      req.body && req.body.admin_comment,
      req.admin || req.user || null
    );
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

function stats(req, res) {
  res.json({
    ok: true,
    data: {
      stats: getAdminStats()
    }
  });
}

function weeklySalesAnalytics(req, res) {
  res.json({
    ok: true,
    data: {
      weekly_sales: getWeeklySalesAnalytics(req.query.weeks)
    }
  });
}

function memberAnalytics(req, res) {
  res.json({
    ok: true,
    data: {
      members: getMemberAnalytics({
        sort: req.query.sort,
        limit: req.query.limit
      })
    }
  });
}

function productAnalytics(req, res) {
  res.json({
    ok: true,
    data: {
      products: getProductAnalytics(req.query.limit)
    }
  });
}

function pickupAnalytics(req, res) {
  res.json({
    ok: true,
    data: {
      pickup_locations: getPickupAnalytics()
    }
  });
}

function pickupLocations(req, res) {
  res.json({
    ok: true,
    data: {
      pickup_locations: listPickupLocations({ includeInactive: true })
    }
  });
}

function savePickupLocation(req, res, next) {
  try {
    const pickupLocation = updatePickupLocation(Number(req.params.id), req.body || {});
    res.json({
      ok: true,
      data: {
        pickup_location: pickupLocation
      }
    });
  } catch (error) {
    next(error);
  }
}

function weeklyOrder(req, res) {
  res.json({
    ok: true,
    data: {
      weekly_order: getWeeklyOrder()
    }
  });
}

function saveWeeklyOrder(req, res) {
  res.json({
    ok: true,
    data: {
      weekly_order: updateWeeklyOrder(req.body || {})
    }
  });
}

function products(req, res) {
  res.json({
    ok: true,
    data: {
      products: listAllProducts()
    }
  });
}

function addProduct(req, res) {
  const body = req.body || {};
  if (!body.name) {
    res.status(400).json({
      ok: false,
      message: "商品名称不能为空"
    });
    return;
  }

  res.status(201).json({
    ok: true,
    data: {
      product: createProduct(body)
    }
  });
}

function saveProduct(req, res) {
  const product = updateProduct(Number(req.params.id), req.body || {});
  if (!product) {
    res.status(404).json({
      ok: false,
      message: "商品不存在"
    });
    return;
  }

  res.json({
    ok: true,
    data: {
      product
    }
  });
}

function uploadProductImage(req, res) {
  if (!req.file) {
    res.status(400).json({
      ok: false,
      message: "请选择图片"
    });
    return;
  }

  const imageUrl = `/uploads/products/${encodeURIComponent(req.file.filename)}`;
  const product = updateProductImage(Number(req.params.id), imageUrl);
  if (!product) {
    res.status(404).json({
      ok: false,
      message: "商品不存在"
    });
    return;
  }

  res.json({
    ok: true,
    data: {
      image_url: imageUrl,
      product
    }
  });
}

function uploadCollectionImage(req, res) {
  if (!req.file) {
    res.status(400).json({
      ok: false,
      message: "请选择图片"
    });
    return;
  }

  const imageUrl = `/uploads/collection/${encodeURIComponent(req.file.filename)}`;
  res.json({
    ok: true,
    data: {
      image_url: imageUrl,
      image: `${imageUrl}?v=${Date.now()}`,
      file_name: req.file.filename
    }
  });
}

function removeProduct(req, res) {
  const result = deleteProduct(Number(req.params.id));
  if (!result.deleted) {
    if (result.reason === "in_use") {
      res.status(409).json({
        ok: false,
        message: "这个商品已有订单记录，不能删除；可以先关闭本周展示"
      });
      return;
    }

    res.status(404).json({
      ok: false,
      message: "商品不存在"
    });
    return;
  }

  res.json({
    ok: true,
    data: {
      product: result.product
    }
  });
}

function pickupReminderTargets(req, res, next) {
  try {
    res.json({
      ok: true,
      data: {
        notifications: getAllPickupReminderTargetSummaries()
      }
    });
  } catch (error) {
    next(error);
  }
}

async function sendPickupReminderNotice(req, res, next) {
  try {
    const result = await sendPickupReminder((req.body && req.body.pickup) || req.params.pickup);
    res.json({
      ok: true,
      data: {
        notification: result
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  orders,
  orderDetail,
  updateOrderStatus: saveOrderStatus,
  updateOrderPayment: saveOrderPayment,
  updateOrderComment: saveOrderComment,
  stats,
  weeklySalesAnalytics,
  memberAnalytics,
  productAnalytics,
  pickupAnalytics,
  pickupLocations,
  savePickupLocation,
  weeklyOrder,
  saveWeeklyOrder,
  products,
  addProduct,
  saveProduct,
  uploadProductImage,
  uploadCollectionImage,
  removeProduct,
  pickupReminderTargets,
  sendPickupReminderNotice
};
