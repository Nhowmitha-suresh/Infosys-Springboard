// Clinical Rule Engine (server-side)
// -------------------------------------------------------------------------
// This mirrors the shape/logic of the frontend's demo rule set
// (src/services/clinicalRuleEngine.js) so alert output is compatible with
// what the UI already expects, but runs against real vitals input on the
// backend and persists every evaluation to `rule_executions`, plus a
// `notifications` row for every rule that fires.
//
// Rules are looked up from the `clinical_rules` table by `rule_name`, so
// the human-readable rule catalog stays data-driven (name/description/
// condition/action/is_active all live in Postgres) while the actual
// evaluation predicates live here in code, since the schema stores
// `condition`/`action` as free-text for display/audit rather than a
// structured expression language.

function rrVariance(history) {
  if (!history || history.length < 4) return 0;
  const recent = history.slice(-6).map((h) => h.hr);
  const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
  const variance =
    recent.reduce((sum, v) => sum + (v - mean) ** 2, 0) / recent.length;
  return Math.sqrt(variance) / mean;
}

// Keyed by clinical_rules.rule_name — must match seeds/seedRules.js exactly.
export const RULE_DEFINITIONS = {
  "Irregular HR pattern (possible AFib)": {
    category: "Cardiac",
    severity: "critical",
    evaluate: (vitals, history) => {
      if (vitals.context !== "At rest") return null;
      if (vitals.hr < 130) return null;
      const variance = rrVariance(history);
      if (variance < 0.12) return null;
      const confidence = Math.min(0.97, 0.55 + variance * 1.6);
      return {
        message: `HR spike ${vitals.hr} bpm at rest (baseline ${vitals.baselineHr} bpm)`,
        analysis: "Possible atrial fibrillation",
        confidence,
        autoActions: ["Notified cardiologist", "Scheduled ECG"],
      };
    },
  },
  "Low blood oxygen": {
    category: "Respiratory",
    severity: "critical",
    evaluate: (vitals) => {
      if (vitals.spo2 >= 90) return null;
      const confidence = Math.min(0.98, 0.7 + (90 - vitals.spo2) * 0.03);
      return {
        message: `SpO2 dropped to ${vitals.spo2}%`,
        analysis: "Possible hypoxemia",
        confidence,
        autoActions: ["Paged on-call nurse", "Flagged for oxygen check"],
      };
    },
  },
  "Sustained tachycardia": {
    category: "Cardiac",
    severity: "warning",
    evaluate: (vitals) => {
      if (vitals.context !== "At rest") return null;
      if (vitals.hr < 100 || vitals.hr >= 130) return null;
      const confidence = 0.55 + (vitals.hr - 100) * 0.01;
      return {
        message: `Resting HR elevated to ${vitals.hr} bpm`,
        analysis: "Sustained tachycardia",
        confidence,
        autoActions: ["Logged for care team review"],
      };
    },
  },
  "Hypertensive reading": {
    category: "Cardiac",
    severity: "warning",
    evaluate: (vitals) => {
      if (vitals.systolic < 150) return null;
      const confidence = Math.min(0.95, 0.5 + (vitals.systolic - 150) * 0.015);
      return {
        message: `Systolic BP reading ${vitals.systolic} mmHg`,
        analysis: "Possible hypertensive episode",
        confidence,
        autoActions: ["Notified care team"],
      };
    },
  },
  "Elevated temperature": {
    category: "General",
    severity: "info",
    evaluate: (vitals) => {
      if (vitals.temp < 38.0) return null;
      const confidence = Math.min(0.9, 0.5 + (vitals.temp - 38.0) * 0.2);
      return {
        message: `Temperature ${vitals.temp.toFixed(1)}°C`,
        analysis: "Possible febrile episode",
        confidence,
        autoActions: ["Added to nurse round list"],
      };
    },
  },
};

/**
 * Evaluates every active rule row (loaded from clinical_rules) against a
 * single vitals reading + short history.
 *
 * @param {Array<{rule_id:number, rule_name:string}>} activeRules  rows from clinical_rules where is_active = true
 * @param {{id:string,name:string}} patient
 * @param {object} vitals   { hr, spo2, systolic, diastolic, temp, context, baselineHr }
 * @param {Array<object>} history  recent vitals readings for this patient (oldest -> newest)
 * @returns {Array<object>} fired alerts, each carrying the matching rule_id
 */
export function evaluateRules(activeRules, patient, vitals, history) {
  const fired = [];

  for (const rule of activeRules) {
    const definition = RULE_DEFINITIONS[rule.rule_name];
    if (!definition) continue; // custom/unknown rule with no coded predicate — skipped, still auditable via clinical_rules

    const result = definition.evaluate(vitals, history);
    if (result) {
      fired.push({
        ruleId: rule.rule_id,
        ruleName: rule.rule_name,
        category: definition.category,
        severity: definition.severity,
        patientId: patient.id,
        patientName: patient.name,
        vitals,
        timestamp: new Date(),
        ...result,
      });
    }
  }

  return fired;
}

export function severityTitle(severity) {
  switch (severity) {
    case "critical":
      return "Critical alert";
    case "warning":
      return "Monitoring warning";
    default:
      return "Monitoring update";
  }
}
