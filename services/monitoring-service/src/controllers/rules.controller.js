import { query } from "../db.js";
import { RULE_DEFINITIONS } from "../services/ruleEngine.service.js";

// clinical_rules only stores rule_name/description/condition/action/is_active
// (per the provided schema) — category and severity live in code
// (ruleEngine.service.js) since they drive UI display, not evaluation. This
// merges them into API responses so the frontend doesn't need its own copy.
function enrich(row) {
  const def = RULE_DEFINITIONS[row.rule_name];
  return {
    ...row,
    category: def?.category || "General",
    severity: def?.severity || "info",
  };
}

export async function listRules(req, res, next) {
  try {
    const { activeOnly } = req.query;
    const where = activeOnly === "true" ? "WHERE is_active = TRUE" : "";
    const { rows } = await query(
      `SELECT * FROM clinical_rules ${where} ORDER BY rule_id ASC`
    );
    res.json(rows.map(enrich));
  } catch (err) {
    next(err);
  }
}

export async function getRule(req, res, next) {
  try {
    const { rows } = await query(`SELECT * FROM clinical_rules WHERE rule_id = $1`, [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: "Rule not found" });
    res.json(enrich(rows[0]));
  } catch (err) {
    next(err);
  }
}

export async function createRule(req, res, next) {
  try {
    const { ruleName, description, condition, action, isActive = true } = req.body;
    if (!ruleName || !description || !condition || !action) {
      return res
        .status(400)
        .json({ error: "ruleName, description, condition and action are required" });
    }

    const { rows } = await query(
      `INSERT INTO clinical_rules (rule_name, description, condition, action, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [ruleName, description, condition, action, isActive]
    );
    res.status(201).json(enrich(rows[0]));
  } catch (err) {
    next(err);
  }
}

export async function updateRule(req, res, next) {
  try {
    const { ruleName, description, condition, action, isActive } = req.body;

    const { rows } = await query(
      `UPDATE clinical_rules SET
         rule_name   = COALESCE($2, rule_name),
         description = COALESCE($3, description),
         condition   = COALESCE($4, condition),
         action      = COALESCE($5, action),
         is_active   = COALESCE($6, is_active)
       WHERE rule_id = $1
       RETURNING *`,
      [req.params.id, ruleName, description, condition, action, isActive]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Rule not found" });
    res.json(enrich(rows[0]));
  } catch (err) {
    next(err);
  }
}

export async function deleteRule(req, res, next) {
  try {
    const { rows } = await query(
      `DELETE FROM clinical_rules WHERE rule_id = $1 RETURNING rule_id`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Rule not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
