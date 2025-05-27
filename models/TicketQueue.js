const db = require("../config/database");

class TicketQueue {
  static async add(ticketId) {
    const positionRes = await db.query(
      "SELECT COALESCE(MAX(queue_position), 0) + 1 AS next_position FROM ticket_queue"
    );
    const nextPosition = positionRes.rows[0].next_position;

    const result = await db.query(
      "INSERT INTO ticket_queue (ticket_id, queue_position) VALUES ($1, $2) RETURNING *",
      [ticketId, nextPosition]
    );
    return result.rows[0];
  }

  static async remove(ticketId) {
    const result = await db.query(
      "DELETE FROM ticket_queue WHERE ticket_id = $1 RETURNING *",
      [ticketId]
    );
    return result.rows[0];
  }

  static async countWaiting() {
    const result = await db.query(
      "SELECT COUNT(*) FROM tickets WHERE status = $1",
      ["waiting"]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = TicketQueue;
