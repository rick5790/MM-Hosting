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
      cancel_reason TEXT NOT NULL DEFAULT '',
      cancelled_at TEXT,
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

    -- 后台手动补录使用图鉴快照，不占用本周商品库存，也不要求图鉴项存在于 products。
    -- 独立表避免重建旧 order_items 表，现有订单和外键保持原样。
    CREATE TABLE IF NOT EXISTS manual_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      collection_item_id INTEGER,
      item_source TEXT NOT NULL DEFAULT 'collection',
      item_name TEXT NOT NULL,
      item_image_url TEXT NOT NULL DEFAULT '',
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (collection_item_id) REFERENCES collection_items(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_manual_order_items_order ON manual_order_items(order_id);

    -- 手动历史团购的展示元数据。订单本身的 created_at/group_id 保持不变，
    -- 历史列表与营收分析统一读取这里的标题和团购日期。
    CREATE TABLE IF NOT EXISTS manual_order_groups (
      group_id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      order_date TEXT NOT NULL,
      pickup_date TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cake_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      cake_id TEXT NOT NULL,
      cake_name TEXT NOT NULL,
      flavor TEXT,
      unit_price REAL NOT NULL DEFAULT 0,
      pickup_date TEXT NOT NULL,
      preferred_time TEXT,
      customer_name TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      admin_comment TEXT NOT NULL DEFAULT '',
      admin_seen_at TEXT,
      cancel_reason TEXT NOT NULL DEFAULT '',
      cancelled_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- 长期登录 session：只保存原始 token 的哈希，原始 token 通过 HttpOnly Cookie 返回。
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_hash TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

    -- 重复登录账号的只读身份归并。历史订单仍保留原始 user_id，不做迁移。
    CREATE TABLE IF NOT EXISTS user_account_links (
      secondary_user_id INTEGER PRIMARY KEY,
      canonical_user_id INTEGER NOT NULL,
      linked_by TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (secondary_user_id) REFERENCES users(id),
      FOREIGN KEY (canonical_user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_user_account_links_canonical ON user_account_links(canonical_user_id);

    CREATE TABLE IF NOT EXISTS collection_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_en TEXT,
      category TEXT NOT NULL,
      image_file TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Excel 导入的历史销售独立存放，不创建用户、订单或订单商品。
    CREATE TABLE IF NOT EXISTS historical_sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_date TEXT NOT NULL,
      product_name TEXT NOT NULL,
      total_amount REAL NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 0,
      original_product_name TEXT NOT NULL DEFAULT '',
      source_file TEXT NOT NULL,
      source_sheet TEXT NOT NULL DEFAULT 'Los Angeles Sales Data',
      source_row INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(source_file, source_sheet, source_row)
    );
    CREATE INDEX IF NOT EXISTS idx_historical_sales_date ON historical_sales(sale_date);
  `);

  ensureColumn("historical_sales", "quantity", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("products", "limit_per_order", "INTEGER");
  ensureColumn("products", "weekly_order_id", "INTEGER");
  ensureColumn("products", "category", "TEXT NOT NULL DEFAULT 'Dessert'");
  ensureColumn("products", "sort_order", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("products", "updated_at", "TEXT");
  // 早期种子数据带的是小程序仓库里的相对路径，网页端解析不了，按“没有图片”处理。
  db.exec("UPDATE products SET image_url = '' WHERE image_url LIKE '../%'");
  ensureColumn("users", "notification_enabled", "INTEGER NOT NULL DEFAULT 1");
  ensureColumn("users", "google_id", "TEXT");
  ensureColumn("users", "email", "TEXT");
  ensureColumn("users", "name", "TEXT");
  ensureColumn("users", "picture", "TEXT");
  ensureColumn("users", "login_type", "TEXT");
  ensureColumn("users", "last_login_at", "TEXT");
  ensureColumn("users", "tag", "TEXT NOT NULL DEFAULT 'user'");
  ensureColumn("users", "note", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("users", "wechat_id", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("users", "deposit_balance", "REAL NOT NULL DEFAULT 0");
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL");
  db.exec("UPDATE users SET login_type = 'guest' WHERE login_type IS NULL AND openid LIKE 'local:%'");
  db.exec("UPDATE users SET tag = 'user' WHERE tag IS NULL OR tag = ''");
  ensureColumn("orders", "weekly_order_number", "TEXT");
  ensureColumn("orders", "group_id", "TEXT");
  ensureColumn("orders", "group_order_number", "INTEGER");
  ensureColumn("orders", "admin_comment", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("orders", "payment_status", "TEXT NOT NULL DEFAULT 'non_paid'");
  ensureColumn("orders", "payment_method", "TEXT");
  ensureColumn("orders", "payment_note", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("orders", "paid_at", "TEXT");
  ensureColumn("orders", "payment_marked_by", "TEXT");
  ensureColumn("orders", "admin_seen_at", "TEXT");
  ensureColumn("orders", "cancel_reason", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("orders", "cancelled_at", "TEXT");
  // 余额抵扣只影响新订单；旧订单的 amount_due 保持 NULL，并在读取时回退到 total_amount。
  ensureColumn("orders", "deposit_applied", "REAL NOT NULL DEFAULT 0");
  ensureColumn("orders", "amount_due", "REAL");
  // 旧订单继续按原逻辑管理库存；新手动图鉴订单显式写 0，状态变化也不碰库存。
  ensureColumn("orders", "inventory_managed", "INTEGER NOT NULL DEFAULT 1");
  // 手动订单商品保存来源快照；旧数据默认来自甜品图鉴，新蛋糕项标记为 cake。
  ensureColumn("manual_order_items", "item_source", "TEXT NOT NULL DEFAULT 'collection'");
  ensureColumn("manual_order_groups", "pickup_date", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("cake_orders", "cancel_reason", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("cake_orders", "cancelled_at", "TEXT");
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
    image_url: "",
    price: 15,
    stock: 10
  });
  insert.run({
    name: "迪拜糯曲奇",
    description: "可可外层包裹软糯夹心，适合按盒数记录预定。",
    image_url: "",
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
