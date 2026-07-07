const { listProducts } = require("../services/productService");

function index(req, res) {
  res.json({
    ok: true,
    data: {
      products: listProducts()
    }
  });
}

module.exports = {
  index
};
