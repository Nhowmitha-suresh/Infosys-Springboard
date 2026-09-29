import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Supports either a single DATABASE_URL or discrete PG* env vars.
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "postgres",
        database: process.env.PGDATABASE || "medisphere",
      }
);

pool.on("error", (err) => {
  // Errors on idle clients shouldn't crash the whole process.
  console.error("Unexpected PostgreSQL client error:", err);
});

export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.SQL_DEBUG === "true") {
    console.log("executed query", { text, duration, rows: result.rowCount });
  }
  return result;
}

export function getPool() {
  return pool;
}

export default pool;
