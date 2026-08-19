const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), "makkie-cancel-audit-"));
process.env.DB_FILE = path.join(testDir, "test.sqlite");
process.env.UPLOAD_DIR = path.join(testDir, "uploads");

const { db, initDb } = require("../db");
const { cancelOrder } = require("../services/orderService");
const { cancelCakeOrder } = require("../services/cakeOrderService");

try {
  initDb();

  const userId = Number(db.prepare("INSERT INTO users (openid, nickname) VALUES (?, ?)").run("cancel-audit-user", "Cancel Audit").lastInsertRowid);
  const pickupId = Number(db.prepare("INSERT INTO pickup_locations (name, address, is_active) VALUES (?, ?, 1)").run("Audit", "Audit").lastInsertRowid);
  const groupId = "20991231";
  const weeklyOrder = {
    is_open: true,
    start_at: "2020-01-01 00:00:00",
    end_at: "2099-12-31 23:59:59",
    order_deadline_at: "2099-12-31 23:59:59"
  };
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("active_group_id", groupId);
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("weekly_order", JSON.stringify(weeklyOrder));

  const orderId = Number(db.prepare(`
    INSERT INTO orders (
      user_id, pickup_location_id, total_amount, status, group_id,
      group_order_number, inventory_managed
    ) VALUES (?, ?, 0, 'pending', ?, 1, 0)
  `).run(userId, pickupId, groupId).lastInsertRowid);
  const cancelledOrder = cancelOrder(orderId, { id: userId });
  assert.strictEqual(cancelledOrder.status, "cancelled");
  assert.strictEqual(cancelledOrder.cancel_reason, "用户主动取消");
  assert.ok(cancelledOrder.cancelled_at, "regular order should record cancelled_at");

  const cakeOrderId = Number(db.prepare(`
    INSERT INTO cake_orders (
      user_id, cake_id, cake_name, unit_price, pickup_date, status
    ) VALUES (?, 'audit-cake', 'Audit Cake', 0, '2099-12-31', 'pending')
  `).run(userId).lastInsertRowid);
  const cancelledCakeOrder = cancelCakeOrder(cakeOrderId, { id: userId });
  assert.strictEqual(cancelledCakeOrder.status, "cancelled");
  assert.strictEqual(cancelledCakeOrder.cancel_reason, "用户主动取消");
  assert.ok(cancelledCakeOrder.cancelled_at, "cake order should record cancelled_at");

  console.log("PASS user cancellation reason and timestamp for weekly and cake orders");
} finally {
  db.close();
  fs.rmSync(testDir, { recursive: true, force: true });
}
