const db = require("../config/database");
const { BERTH_TYPES } = require("../config/constants");

class Berth {
  static async findAvailableByType(type) {
    const result = await db.query(
      "SELECT * FROM berths WHERE type = $1 AND is_available = true LIMIT 1 FOR UPDATE",
      [type]
    );
    return result.rows[0];
  }

  static async findAvailableConfirmed() {
    const result = await db.query(
      `SELECT * FROM berths 
      WHERE type IN ($1, $2, $3) 
      AND is_available = true 
      LIMIT 1 FOR UPDATE`,
      [BERTH_TYPES.LOWER, BERTH_TYPES.MIDDLE, BERTH_TYPES.UPPER]
    );
    return result.rows[0];
  }

  static async updateAvailability(id, isAvailable) {
    const result = await db.query(
      "UPDATE berths SET is_available = $1 WHERE id = $2 RETURNING *",
      [isAvailable, id]
    );
    return result.rows[0];
  }

  static async countAvailableByType() {
    const result = await db.query(
      "SELECT type, COUNT(*) as count FROM berths WHERE is_available = true GROUP BY type"
    );
    return result.rows;
  }

  static async listAvailable() {
    const result = await db.query(
      "SELECT * FROM berths WHERE is_available = true ORDER BY coach, number"
    );
    return result.rows;
  }
}

module.exports = Berth;
