import { query } from "../db.js";
import { evaluateRules } from "../services/ruleEngine.service.js";
import { createNotification } from "../services/notification.service.js";

async function getActiveRules() {
  const { rows } = await query(
    `SELECT rule_id, rule_name FROM clinical_rules WHERE is_active = TRUE`
  );
  return rows;
}

// Milestone 2's `ml_predictions` table (populated via the ML Models ->
// Prediction page, run against the ml_patient_data demo set P001-P003)
// is the FK target for both rule_executions and notifications. If the
// caller doesn't pass a predictionId explicitly, fall back to that
// patient's most recent one.
async function resolvePredictionId(patientId, predictionId) {
  if (predictionId) return predictionId;

  const { rows } = await query(
    `SELECT prediction_id FROM ml_predictions
      WHERE patient_id = $1
      ORDER BY prediction_id DESC
      LIMIT 1`,
    [patientId]
  );

  if (rows.length === 0) {
    const err = new Error(
      `No prediction found for patient ${patientId}. Pass predictionId explicitly, or run a Prediction for this patient first from ML Models -> Prediction (Milestone 2).`
    );
    err.status = 422;
    throw err;
  }
  return rows[0].prediction_id;
}

/**
 * POST /api/monitoring/evaluate
 * Body: { patient: { id, name, baselineHr }, vitals: {...}, history: [...], predictionId? }
 *
 * Runs every active clinical rule against the supplied vitals reading.
 * For every rule that fires: logs a rule_executions row, creates a
 * notification row, and pushes it in real time over Socket.IO.
 * Also logs one "not triggered" rule_executions row per rule that did
 * NOT fire, so clinical_rule_results carries a full audit trail.
 */
export async function evaluateVitals(req, res, next) {
  try {
    const { patient, vitals, history = [], predictionId } = req.body;

    if (!patient?.id || !vitals) {
      return res.status(400).json({ error: "patient.id and vitals are required" });
    }

    const activeRules = await getActiveRules();
    if (activeRules.length === 0) {
      return res.status(200).json({ fired: [], message: "No active clinical rules configured" });
    }

    const resolvedPredictionId = await resolvePredictionId(patient.id, predictionId);

    const fired = evaluateRules(activeRules, patient, vitals, history);
    const firedRuleIds = new Set(fired.map((a) => a.ruleId));

    // Audit every rule evaluated this tick (fired AND not fired).
    await Promise.all(
      activeRules.map((rule) => {
        const alert = fired.find((a) => a.ruleId === rule.rule_id);
        const triggered = firedRuleIds.has(rule.rule_id);
        const result = triggered
          ? `${alert.analysis} (confidence ${(alert.confidence * 100).toFixed(0)}%)`
          : "No condition met";
        return query(
          `INSERT INTO rule_executions (rule_id, patient_id, prediction_id, triggered, result)
           VALUES ($1, $2, $3, $4, $5)`,
          [rule.rule_id, patient.id, resolvedPredictionId, triggered, result]
        );
      })
    );

    const notifications = [];
    for (const alert of fired) {
      alert.predictionId = resolvedPredictionId;
      const notification = await createNotification(alert);
      notifications.push(notification);
    }

    res.status(200).json({
      fired: fired.map((a) => ({
        id: `alert-${a.ruleId}-${Date.now()}`,
        ruleId: a.ruleId,
        ruleName: a.ruleName,
        category: a.category,
        severity: a.severity,
        patientId: a.patientId,
        patientName: a.patientName,
        vitals: a.vitals,
        timestamp: a.timestamp,
        message: a.message,
        analysis: a.analysis,
        confidence: a.confidence,
        autoActions: a.autoActions,
      })),
      notifications,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/monitoring/executions?patientId=&ruleId=&limit=
 * Reads from the clinical_rule_results view (rule_executions joined to clinical_rules).
 */
export async function listExecutions(req, res, next) {
  try {
    const { patientId, ruleId, limit = 100 } = req.query;
    const conditions = [];
    const params = [];

    if (patientId) {
      params.push(patientId);
      conditions.push(`patient_id = $${params.length}`);
    }
    if (ruleId) {
      params.push(ruleId);
      conditions.push(`rule_id = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    params.push(Number(limit));

    const { rows } = await query(
      `SELECT * FROM clinical_rule_results
         ${where}
       ORDER BY executed_at DESC
       LIMIT $${params.length}`,
      params
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}
