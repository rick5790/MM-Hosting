const { db } = require("../db");

function normalizePickupLocation(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    label: row.name,
    address: row.address,
    pickup_time: row.pickup_time || "",
    time: row.pickup_time || "",
    is_active: row.is_active
  };
}

function listPickupLocations(options = {}) {
  const includeInactive = Boolean(options.includeInactive);
  const rows = db
    .prepare(`
      SELECT id, name, address, pickup_time, is_active
      FROM pickup_locations
      ${includeInactive ? "" : "WHERE is_active = 1"}
      ORDER BY id ASC
    `)
    .all();
  return rows.map(normalizePickupLocation);
}

function getPickupLocationById(id) {
  const row = db
    .prepare(`
      SELECT id, name, address, pickup_time, is_active
      FROM pickup_locations
      WHERE id = ?
    `)
    .get(Number(id));
  return normalizePickupLocation(row);
}

function updatePickupLocation(id, payload = {}) {
  const pickupId = Number(id);
  if (!pickupId) {
    const error = new Error("自提点不存在");
    error.status = 404;
    throw error;
  }

  const existing = db.prepare("SELECT * FROM pickup_locations WHERE id = ?").get(pickupId);
  if (!existing) {
    const error = new Error("自提点不存在");
    error.status = 404;
    throw error;
  }

  const nextName = payload.name == null ? existing.name : String(payload.name).trim();
  const nextAddress = payload.address == null ? existing.address : String(payload.address).trim();
  const nextPickupTime = payload.pickup_time == null ? (existing.pickup_time || "") : String(payload.pickup_time).trim();

  if (!nextName) {
    const error = new Error("自提点名称不能为空");
    error.status = 400;
    throw error;
  }

  if (!nextAddress) {
    const error = new Error("自提地址不能为空");
    error.status = 400;
    throw error;
  }

  db
    .prepare(`
      UPDATE pickup_locations
      SET name = ?, address = ?, pickup_time = ?
      WHERE id = ?
    `)
    .run(nextName, nextAddress, nextPickupTime, pickupId);

  return getPickupLocationById(pickupId);
}

module.exports = {
  listPickupLocations,
  getPickupLocationById,
  updatePickupLocation
};
