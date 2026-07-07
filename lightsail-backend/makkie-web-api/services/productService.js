const { db } = require("../db");
const { getWeeklyOrder } = require("./weeklyOrderService");

// 公开菜单只显示挂在当前档期下的上架产品，保证官网和后台“本周产品”一致。
function listProducts() {
  const weeklyOrder = getWeeklyOrder();
  const weeklyOrderId = Number(weeklyOrder && weeklyOrder.id) || 0;
  return db
    .prepare(`
      SELECT id, name, description, image_url, price, stock, is_active, limit_per_order, weekly_order_id, created_at
      FROM products
      WHERE is_active = 1 AND weekly_order_id = ?
      ORDER BY id ASC
    `)
    .all(weeklyOrderId);
}

function listAllProducts() {
  return db
    .prepare(`
      SELECT id, name, description, image_url, price, stock, is_active, limit_per_order, weekly_order_id, created_at
      FROM products
      ORDER BY id DESC
    `)
    .all();
}

function getProduct(productId) {
  return db
    .prepare(`
      SELECT id, name, description, image_url, price, stock, is_active, limit_per_order, weekly_order_id, created_at
      FROM products
      WHERE id = ?
    `)
    .get(productId);
}

function createProduct(payload) {
  const result = db
    .prepare(`
      INSERT INTO products (
        name,
        description,
        image_url,
        price,
        stock,
        is_active,
        limit_per_order,
        weekly_order_id,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `)
    .run(
      payload.name,
      payload.description || "",
      payload.image_url || "",
      Number(payload.price) || 0,
      Number(payload.stock) || 0,
      payload.is_active === false || payload.is_active === 0 ? 0 : 1,
      payload.limit_per_order ? Number(payload.limit_per_order) : null,
      payload.weekly_order_id != null && payload.weekly_order_id !== "" ? Number(payload.weekly_order_id) : null
    );

  return getProduct(result.lastInsertRowid);
}

function updateProduct(productId, payload) {
  const existing = getProduct(productId);
  if (!existing) return null;

  db
    .prepare(`
      UPDATE products
      SET name = ?,
          description = ?,
          image_url = ?,
          price = ?,
          stock = ?,
          is_active = ?,
          limit_per_order = ?,
          weekly_order_id = ?
      WHERE id = ?
    `)
    .run(
      payload.name !== undefined ? payload.name : existing.name,
      payload.description !== undefined ? payload.description : existing.description,
      payload.image_url !== undefined ? payload.image_url : existing.image_url,
      payload.price !== undefined ? Number(payload.price) || 0 : existing.price,
      payload.stock !== undefined ? Number(payload.stock) || 0 : existing.stock,
      payload.is_active !== undefined
        ? (payload.is_active === false || payload.is_active === 0 ? 0 : 1)
        : existing.is_active,
      payload.limit_per_order !== undefined
        ? (payload.limit_per_order !== "" ? Number(payload.limit_per_order) : null)
        : existing.limit_per_order,
      payload.weekly_order_id !== undefined
        ? (payload.weekly_order_id != null && payload.weekly_order_id !== "" ? Number(payload.weekly_order_id) : null)
        : existing.weekly_order_id,
      productId
    );

  return getProduct(productId);
}

function updateProductImage(productId, imageUrl) {
  return updateProduct(productId, { image_url: imageUrl });
}

function deleteProduct(productId) {
  const existing = getProduct(productId);
  if (!existing) return { deleted: false, reason: "missing" };

  const orderItemCount = db
    .prepare("SELECT COUNT(*) AS count FROM order_items WHERE product_id = ?")
    .get(productId).count;
  if (orderItemCount > 0) {
    return { deleted: false, reason: "in_use", orderItemCount };
  }

  db.prepare("DELETE FROM products WHERE id = ?").run(productId);
  return { deleted: true, product: existing };
}

module.exports = {
  listProducts,
  listAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateProductImage,
  deleteProduct
};
