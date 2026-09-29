// Dev-only helper — NOT part of the Milestone 3 scope (Clinical Rule
// Engine + Mobile Notifications), just a convenience so you can see the
// engine + notifications fire end-to-end without wiring up a real
// wearable/Kafka feed first. Reads the demo patients (P001-P003) from
// `ml_patient_data` (Milestone 2 — the same VARCHAR-keyed feature table
// rule_executions/notifications have FKs into) and POSTs simulated
// readings to POST /api/monitoring/evaluate every few seconds.
//
// Usage:
//   API_BASE=http://localhost:4000 node scripts/simulateVitals.js

import { query, getPool } from "../src/db.js";

const API_BASE = process.env.API_BASE || "http://localhost:4000";
const INTERVAL_MS = Number(process.env.SIMULATE_INTERVAL_MS) || 3000;
const DEFAULT_BASELINE_HR = 72;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function randomWalk(value, step, min, max) {
  return clamp(value + (Math.random() - 0.5) * step, min, max);
}

async function loadPatients() {
  // ml_patient_data has no `name` column (it's a feature table, not a
  // profile record) — fall back to the patient_id as the display name.
  const { rows } = await query(`SELECT patient_id FROM ml_patient_data ORDER BY patient_id`);
  return rows.map((r) => ({ id: r.patient_id, name: r.patient_id }));
}

function makeState() {
  return {
    hr: DEFAULT_BASELINE_HR,
    spo2: 98,
    systolic: 118,
    diastolic: 76,
    temp: 36.8,
    context: "At rest",
  };
}

async function main() {
  const patients = await loadPatients();
  if (patients.length === 0) {
    console.error(
      "No rows found in `ml_patient_data`. Run database/ml_patient_data.sql first (it ships with 3 demo rows, P001-P003)."
    );
    await getPool().end();
    return;
  }

  const states = new Map(patients.map((p) => [p.id, makeState()]));
  const histories = new Map(patients.map((p) => [p.id, []]));

  console.log(`Simulating vitals for ${patients.length} patient(s) -> ${API_BASE}/api/monitoring/evaluate`);

  setInterval(async () => {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const s = states.get(patient.id);
    const anomaly = Math.random() < 0.22;

    if (anomaly) {
      const type = Math.random();
      if (type < 0.4) {
        s.hr = clamp(DEFAULT_BASELINE_HR + 60 + Math.random() * 30, 0, 220);
        s.context = "At rest";
      } else if (type < 0.7) {
        s.spo2 = clamp(84 + Math.random() * 5, 70, 100);
      } else if (type < 0.9) {
        s.systolic = clamp(155 + Math.random() * 25, 90, 220);
      } else {
        s.temp = clamp(38.2 + Math.random() * 1.2, 35, 41);
      }
    } else {
      s.hr = randomWalk(s.hr, 6, DEFAULT_BASELINE_HR - 10, DEFAULT_BASELINE_HR + 15);
      s.spo2 = randomWalk(s.spo2, 1, 95, 100);
      s.systolic = randomWalk(s.systolic, 4, 105, 135);
      s.diastolic = randomWalk(s.diastolic, 3, 65, 85);
      s.temp = randomWalk(s.temp, 0.1, 36.3, 37.3);
      s.context = Math.random() < 0.15 ? "Light activity" : "At rest";
    }

    const vitals = {
      hr: Math.round(s.hr),
      spo2: Math.round(s.spo2),
      systolic: Math.round(s.systolic),
      diastolic: Math.round(s.diastolic),
      temp: s.temp,
      context: s.context,
      baselineHr: DEFAULT_BASELINE_HR,
    };

    const history = [...histories.get(patient.id), vitals].slice(-24);
    histories.set(patient.id, history);

    try {
      const response = await fetch(`${API_BASE}/api/monitoring/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient, vitals, history }),
      });
      const body = await response.json();
      if (!response.ok) {
        console.error(`[${patient.id}] evaluate failed:`, body.error || body);
      } else if (body.fired?.length) {
        console.log(`[${patient.id}] fired:`, body.fired.map((a) => a.ruleName).join(", "));
      }
    } catch (err) {
      console.error("Failed to reach API:", err.message);
    }
  }, INTERVAL_MS);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
