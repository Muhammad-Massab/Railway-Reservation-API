const db = require("../config/database");

class Passenger {
  static async create({ name, age, gender, isChildWithParent = false }) {
    const result = await db.query(
      "INSERT INTO passengers (name, age, gender, is_child_with_parent) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, age, gender, isChildWithParent]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query("SELECT * FROM passengers WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }
}

module.exports = Passenger;
