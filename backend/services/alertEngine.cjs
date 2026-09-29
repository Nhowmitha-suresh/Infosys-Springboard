const ALERT_RULES = {
  heartRate: { medium: 25, high: 50 },
  spo2: { medium: 93, high: 90 },
  temperature: { medium: 100.4, high: 102.0 },
  systolicBp: { medium: 140, high: 160 },
};

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function analyzeTelemetry({ vitalType = 'HEART_RATE', value, previousAverage = 90 }) {
  const n = number(value);
  if (n === null) throw new Error('vital value must be a valid number');

  const type = String(vitalType).toUpperCase();
  let severity = 'NORMAL';
  let message = 'Vital sign within configured monitoring range.';
  let alertType = 'NORMAL_TELEMETRY';

  if (type === 'HEART_RATE') {
    const baseline = number(previousAverage);
    if (baseline === null || baseline <= 0) throw new Error('previousAverage must be greater than 0');
    const deviation = Math.abs((n - baseline) / baseline) * 100;
    if (deviation >= ALERT_RULES.heartRate.high) severity = 'HIGH';
    else if (deviation >= ALERT_RULES.heartRate.medium) severity = 'MEDIUM';
    if (severity !== 'NORMAL') {
      alertType = 'POSSIBLE_CARDIAC_ANOMALY';
      message = severity === 'HIGH'
        ? `High-risk cardiac anomaly detected: ${n} bpm (${deviation.toFixed(1)}% from baseline).`
        : `Moderate cardiac anomaly detected: ${n} bpm (${deviation.toFixed(1)}% from baseline).`;
    }
    return {
      alert: severity !== 'NORMAL', severity, alertType, message,
      telemetry: { vitalType: type, value: n, previousAverage: baseline, deviationPercentage: Number(deviation.toFixed(1)) },
      recommendedActions: severity === 'NORMAL' ? [] : ['Notify clinician', 'Consider ECG review', 'Display dashboard alert'],
      detectedAt: new Date().toISOString()
    };
  }

  if (type === 'SPO2') {
    if (n < ALERT_RULES.spo2.high) severity = 'HIGH';
    else if (n < ALERT_RULES.spo2.medium) severity = 'MEDIUM';
    if (severity !== 'NORMAL') {
      alertType = 'OXYGEN_DESATURATION';
      message = `Oxygen saturation below configured threshold: ${n}%.`;
    }
  } else if (type === 'TEMPERATURE') {
    if (n >= ALERT_RULES.temperature.high) severity = 'HIGH';
    else if (n >= ALERT_RULES.temperature.medium) severity = 'MEDIUM';
    if (severity !== 'NORMAL') {
      alertType = 'FEVER_ANOMALY';
      message = `Elevated temperature detected: ${n} °F.`;
    }
  } else if (type === 'BLOOD_PRESSURE') {
    if (n >= ALERT_RULES.systolicBp.high) severity = 'HIGH';
    else if (n >= ALERT_RULES.systolicBp.medium) severity = 'MEDIUM';
    if (severity !== 'NORMAL') {
      alertType = 'HYPERTENSION_ANOMALY';
      message = `Elevated systolic blood pressure detected: ${n} mmHg.`;
    }
  }

  return {
    alert: severity !== 'NORMAL', severity, alertType, message,
    telemetry: { vitalType: type, value: n },
    recommendedActions: severity === 'NORMAL' ? [] : ['Notify clinician', 'Review recent vital-sign trend', 'Display dashboard alert'],
    detectedAt: new Date().toISOString()
  };
}

function analyzeHeartRate({ heartRate, previousAverage }) {
  return analyzeTelemetry({ vitalType: 'HEART_RATE', value: heartRate, previousAverage });
}

module.exports = { analyzeHeartRate, analyzeTelemetry };
