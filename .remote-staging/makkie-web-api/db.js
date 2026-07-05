const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DB_FILE = process.env.DB_FILE || path.join(__dirname, "database.sqlite");
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
const db = new Database(DB_FILE);

function initDb() {
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openid TEXT UNIQUE NOT NULL,
      nickname TEXT,
      avatar_url TEXT,
      phone TEXT,
      order_count INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0,
      last_order_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      price REAL NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pickup_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      pickup_time TEXT,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      pickup_location_id INTEGER NOT NULL,
      customer_name TEXT,
      customer_phone TEXT,
      pickup_time TEXT,
      total_amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (pickup_location_id) REFERENCES pickup_locations(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  ensureColumn("products", "limit_per_order", "INTEGER");
  ensureColumn("users", "notification_enabled", "INTEGER NOT NULL DEFAULT 1");
  ensureColumn("orders", "weekly_order_number", "TEXT");
  ensureColumn("orders", "group_id", "TEXT");
  ensureColumn("orders", "group_order_number", "INTEGER");
  ensureColumn("orders", "admin_comment", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("orders", "payment_status", "TEXT NOT NULL DEFAULT 'non_paid'");
  ensureColumn("orders", "payment_method", "TEXT");
  ensureColumn("orders", "payment_note", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("orders", "paid_at", "TEXT");
  ensureColumn("orders", "payment_marked_by", "TEXT");
  ensureColumn("pickup_locations", "pickup_time", "TEXT");
  backfillGroupOrderNumbers();
  seedPickupLocations();
  seedPickupLocationTimes();
  seedProducts();
  seedWeeklyOrderSettings();
  seedActiveGroupSettings();
  fs.mkdirSync(path.join(UPLOAD_DIR, "products"), { recursive: true });
  fs.mkdirSync(path.join(UPLOAD_DIR, "collection"), { recursive: true });
  fs.mkdirSync(path.join(UPLOAD_DIR, "avatars"), { recursive: true });
}

function ensureColumn(tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function backfillGroupOrderNumbers() {
  const pendingOrders = db
    .prepare(`
      SELECT id, group_id, weekly_order_number, group_order_number, created_at
      FROM orders
      ORDER BY COALESCE(group_id, weekly_order_number, ''), created_at ASC, id ASC
    `)
    .all();
  if (!pendingOrders.some((order) => !order.group_order_number)) return;

  const tx = db.transaction(() => {
    const counters = new Map();
    const updateOrder = db.prepare("UPDATE orders SET group_order_number = ? WHERE id = ?");

    pendingOrders.forEach((order) => {
      const key = String(order.group_id || order.weekly_order_number || "unassigned");
      const current = counters.get(key) || 0;
      const existingNumber = Number(order.group_order_number) || 0;

      if (existingNumber) {
        counters.set(key, Math.max(current, existingNumber));
        return;
      }

      const nextNumber = current + 1;
      counters.set(key, nextNumber);
      updateOrder.run(nextNumber, order.id);
    });
  });

  tx();
}

function seedPickupLocations() {
  const count = db.prepare("SELECT COUNT(*) AS count FROM pickup_locations").get().count;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO pickup_locations (name, address, pickup_time, is_active)
    VALUES (@name, @address, @pickup_time, 1)
  `);

  insert.run({
    name: "Irvine",
    address: "14282 Culver Dr, Irvine, CA 92604",
    pickup_time: "周六 12:30 - 13:00"
  });
  insert.run({
    name: "Los Angeles",
    address: "525 S Santa Fe Ave, Los Angeles, CA 90013",
    pickup_time: "周六 14:00 - 14:30"
  });
}

function seedPickupLocationTimes() {
  const rows = db
    .prepare(`
      SELECT id, name, address, pickup_time
      FROM pickup_locations
      ORDER BY id ASC
    `)
    .all();

  const update = db.prepare("UPDATE pickup_locations SET pickup_time = ? WHERE id = ?");

  rows.forEach((row) => {
    if (String(row.pickup_time || "").trim()) return;
    const haystack = `${row.name || ""} ${row.address || ""}`.toLowerCase();
    if (/irvine|culver|尔湾/.test(haystack)) {
      update.run("周六 12:30 - 13:00", row.id);
      return;
    }
    if (/los angeles|santa fe|洛杉矶/.test(haystack)) {
      update.run("周六 14:00 - 14:30", row.id);
    }
  });
}

function seedProducts() {
  const count = db.prepare("SELECT COUNT(*) AS count FROM products").get().count;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO products (name, description, image_url, price, stock, is_active)
    VALUES (@name, @description, @image_url, @price, @stock, 1)
  `);

  insert.run({
    name: "玫瑰荔枝酸奶拿破仑酥",
    description: "酥皮、酸奶奶油、玫瑰香气和荔枝果肉组合，清甜花果感更明显。",
    image_url: "../../orders_asset/2026-06-09/玫瑰荔枝酸奶拿破仑酥.jpg",
    price: 15,
    stock: 10
  });
  insert.run({
    name: "迪拜糯曲奇",
    description: "可可外层包裹软糯夹心，适合按盒数记录预定。",
    image_url: "../../orders_asset/2026-06-09/迪拜糯曲奇.jpg",
    price: 6,
    stock: 30
  });
}

function seedWeeklyOrderSettings() {
  const existing = db.prepare("SELECT value FROM settings WHERE key = ?").get("weekly_order");
  if (existing) return;

  db
    .prepare("INSERT INTO settings (key, value) VALUES (?, ?)")
    .run(
      "weekly_order",
      JSON.stringify({
        is_open: false,
        start_at: "",
        end_at: ""
      })
    );
}

function makeDefaultActiveGroupId(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function seedActiveGroupSettings() {
  const existing = db.prepare("SELECT value FROM settings WHERE key = ?").get("active_group_id");
  if (existing) return;

  db
    .prepare("INSERT INTO settings (key, value) VALUES (?, ?)")
    .run("active_group_id", makeDefaultActiveGroupId());
}

module.exports = {
  db,
  initDb,
  UPLOAD_DIR
};
