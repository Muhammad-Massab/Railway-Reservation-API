const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "db",
  database: process.env.DB_NAME || "postgres",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect();
    return client;
  },
  initDb: async () => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const typeCheck = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'ticket_status'
        ) as ticket_status_exists,
        EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'berth_type'
        ) as berth_type_exists
      `);

      if (!typeCheck.rows[0].ticket_status_exists) {
        await client.query(
          "CREATE TYPE ticket_status AS ENUM ('confirmed', 'rac', 'waiting', 'cancelled')"
        );
      }
      if (!typeCheck.rows[0].berth_type_exists) {
        await client.query(
          "CREATE TYPE berth_type AS ENUM ('lower', 'upper', 'middle', 'side_lower', 'side_upper')"
        );
      }

      await client.query(`
        CREATE TABLE IF NOT EXISTS passengers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          age INTEGER NOT NULL,
          gender VARCHAR(10) NOT NULL,
          is_child_with_parent BOOLEAN DEFAULT false
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS berths (
          id SERIAL PRIMARY KEY,
          number VARCHAR(10) UNIQUE NOT NULL,
          type berth_type NOT NULL,
          coach VARCHAR(5) NOT NULL,
          is_available BOOLEAN DEFAULT true
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS tickets (
          id SERIAL PRIMARY KEY,
          pnr VARCHAR(10) UNIQUE NOT NULL,
          passenger_id INTEGER REFERENCES passengers(id) ON DELETE CASCADE,
          status ticket_status NOT NULL,
          berth_id INTEGER REFERENCES berths(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS ticket_queue (
          id SERIAL PRIMARY KEY,
          ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
          queue_position INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const berthCount = await client.query("SELECT COUNT(*) FROM berths");
      if (parseInt(berthCount.rows[0].count) === 0) {
        await initializeBerths(client);
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Database initialization error:", err);
      throw err;
    } finally {
      client.release();
    }
  },
};

async function initializeBerths(client) {
  try {
    for (let coach = 1; coach <= 3; coach++) {
      for (let i = 1; i <= 21; i++) {
        let type;
        if (i % 3 === 1) type = "lower";
        else if (i % 3 === 2) type = "middle";
        else type = "upper";

        await client.query(
          "INSERT INTO berths (number, type, coach, is_available) VALUES ($1, $2, $3, true)",
          [`${coach}${i.toString().padStart(2, "0")}`, type, `C${coach}`]
        );
      }
    }

    for (let i = 1; i <= 9; i++) {
      await client.query(
        "INSERT INTO berths (number, type, coach, is_available) VALUES ($1, $2, $3, true)",
        [`R${i.toString().padStart(2, "0")}`, "side_lower", "RAC"]
      );
    }
  } catch (err) {
    console.error("Error initializing berths:", err);
    throw err;
  }
}
