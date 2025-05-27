const db = require("../config/database");
const { TICKET_STATUS } = require("../config/constants");

class Ticket {
  static async create({ pnr, passengerId, status, berthId = null }) {
    const result = await db.query(
      "INSERT INTO tickets (pnr, passenger_id, status, berth_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [pnr, passengerId, status, berthId]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query("SELECT * FROM tickets WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await db.query(
      "UPDATE tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, id]
    );
    return result.rows[0];
  }

  static async findFirstRac() {
    const result = await db.query(
      `SELECT * FROM tickets 
      WHERE status = $1 
      ORDER BY created_at 
      LIMIT 1 FOR UPDATE`,
      [TICKET_STATUS.RAC]
    );
    return result.rows[0];
  }

  static async findFirstWaiting() {
    const result = await db.query(
      `SELECT t.* FROM tickets t
      JOIN ticket_queue tq ON t.id = tq.ticket_id
      WHERE t.status = $1
      ORDER BY tq.queue_position
      LIMIT 1 FOR UPDATE`,
      [TICKET_STATUS.WAITING]
    );
    return result.rows[0];
  }

  static async countByStatus() {
    const result = await db.query(
      "SELECT status, COUNT(*) as count FROM tickets WHERE status IN ($1, $2) GROUP BY status",
      [TICKET_STATUS.CONFIRMED, TICKET_STATUS.RAC]
    );
    return result.rows;
  }

  static async listBooked() {
    const result = await db.query(
      `SELECT t.id, t.pnr, t.status, t.created_at, 
              p.name, p.age, p.gender, 
              b.number as berth_number, b.type as berth_type, b.coach
       FROM tickets t
       JOIN passengers p ON t.passenger_id = p.id
       LEFT JOIN berths b ON t.berth_id = b.id
       WHERE t.status IN ($1, $2)
       ORDER BY t.created_at`,
      [TICKET_STATUS.CONFIRMED, TICKET_STATUS.RAC]
    );
    return result.rows;
  }
}

module.exports = Ticket;
