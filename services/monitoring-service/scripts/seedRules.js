// Seeds clinical_rules with the same 5 rules the frontend's demo engine
// used to hardcode client-side (src/services/clinicalRuleEngine.js), so
// evaluation output stays identical once the real engine (ruleEngine.service.js)
// takes over. Safe to re-run: skips any rule_name that already exists.

import { query, getPool } from "../src/db.js";

const RULES = [
  {
    ruleName: "Irregular HR pattern (possible AFib)",
    description: "Heart rate spike with irregular R-R interval variance at rest",
    condition: "context = 'At rest' AND hr >= 130 AND rr_variance >= 0.12",
    action: "Notify cardiologist; schedule ECG",
  },
  {
    ruleName: "Low blood oxygen",
    description: "SpO2 below 90% for two consecutive readings",
    condition: "spo2 < 90",
    action: "Page on-call nurse; flag for oxygen check",
  },
  {
    ruleName: "Sustained tachycardia",
    description: "Heart rate above 100 bpm sustained at rest",
    condition: "context = 'At rest' AND hr >= 100 AND hr < 130",
    action: "Log for care team review",
  },
  {
    ruleName: "Hypertensive reading",
    description: "Systolic BP above 150 mmHg",
    condition: "systolic >= 150",
    action: "Notify care team",
  },
  {
    ruleName: "Elevated temperature",
    description: "Body temperature above 38.0°C",
    condition: "temp >= 38.0",
    action: "Add to nurse round list",
  },
];

async function seed() {
  for (const rule of RULES) {
    const { rows } = await query(
      `SELECT rule_id FROM clinical_rules WHERE rule_name = $1`,
      [rule.ruleName]
    );

    if (rows.length > 0) {
      console.log(`Skipping "${rule.ruleName}" (already exists, rule_id=${rows[0].rule_id})`);
      continue;
    }

    const inserted = await query(
      `INSERT INTO clinical_rules (rule_name, description, condition, action, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING rule_id, rule_name`,
      [rule.ruleName, rule.description, rule.condition, rule.action]
    );
    console.log(`Inserted "${inserted.rows[0].rule_name}" (rule_id=${inserted.rows[0].rule_id})`);
  }

  await getPool().end();
}

seed().catch((err) => {
  console.error("Seeding clinical_rules failed:", err);
  process.exit(1);
});
