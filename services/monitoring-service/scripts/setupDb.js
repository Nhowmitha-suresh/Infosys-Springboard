// Runs src/db/milestone3_database.sql against the configured database.
// Requires the Milestone 2 ML tables (ml_patient_data, ml_predictions)
// to already exist, since clinical_rules/rule_executions/notifications
// reference them via foreign keys. In the Docker Compose stack this file
// is also mounted into postgres's initdb.d (as database/z_monitoring_schema.sql)
// and applies itself automatically on first boot -- this script is only
// needed for a manual/non-Docker setup or to re-apply against an
// existing database.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPool } from "../src/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, "..", "src", "db", "milestone3_database.sql");

async function run() {
  const sql = fs.readFileSync(sqlPath, "utf8");
  const pool = getPool();
  console.log(`Applying schema from ${sqlPath} ...`);
  await pool.query(sql);
  console.log("Milestone 3 schema applied successfully.");
  await pool.end();
}

run().catch((err) => {
  console.error("Failed to apply Milestone 3 schema:", err.message);
  console.error(
    "\nMake sure the Milestone 2 ML tables (ml_patient_data, ml_predictions) already exist in this database — they are prerequisites referenced by foreign keys in this script. Run the database/*.sql scripts from the platform root first."
  );
  process.exit(1);
});
