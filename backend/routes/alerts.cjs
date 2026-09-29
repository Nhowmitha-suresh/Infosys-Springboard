const express = require("express");
const Alert = require("../models/Alert");
const mongoose = require("mongoose");
const { analyzeTelemetry } = require("../services/alertEngine.cjs");

// Safe in-memory fallback keeps the presentation demo functional when MongoDB is temporarily unavailable.
const memoryAlerts = [
  { alertId: 'DEMO-ALT-001', patientId: 'PAT-001', patientName: 'Sarah M.', vital: 'Heart Rate', value: '145 bpm', severity: 'MEDIUM', status: 'ACTIVE', message: 'Tachycardia detected during continuous monitoring.', notes: 'Notify clinician | Review recent heart-rate trend', detectedAt: new Date() },
  { alertId: 'DEMO-ALT-002', patientId: 'PAT-006', patientName: 'David P.', vital: 'Heart Rate', value: '152 bpm', severity: 'HIGH', status: 'ACTIVE', message: 'High heart rate detected during continuous monitoring.', notes: 'Notify clinician | Consider ECG review', detectedAt: new Date(Date.now() - 60000) },
  { alertId: 'DEMO-ALT-003', patientId: 'PAT-007', patientName: 'Elena Rostova', vital: 'Blood Oxygen (SpO₂)', value: '91 %', severity: 'HIGH', status: 'ACTIVE', message: 'Oxygen saturation below configured threshold: 91%.', notes: 'Notify clinician | Review recent vital-sign trend', detectedAt: new Date(Date.now() - 120000) }
];

const router = express.Router();

/*
 * =========================================================
 * GET ALL ALERTS
 * =========================================================
 *
 * Frontend calls:
 *
 * GET /api/alerts
 *
 * Alerts are now loaded from MongoDB instead of
 * hard-coded frontend data.
 */

router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, alerts: memoryAlerts.slice(0, 100), source: 'memory-fallback' });
    }
    try {
      const alerts = await Alert.find({})
        .sort({ detectedAt: -1 })
        .limit(100);
      return res.status(200).json({ success: true, alerts });
    } catch (dbError) {
      return res.status(200).json({ success: true, alerts: memoryAlerts.slice(0, 100), source: 'memory-fallback' });
    }

  } catch (error) {
    console.error(
      "Failed to fetch alerts:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
    });
  }
});


/*
 * =========================================================
 * ANALYZE TELEMETRY
 * =========================================================
 *
 * Frontend sends heart-rate telemetry here.
 *
 * POST /api/alerts/analyze
 *
 * If the Alert Engine detects an anomaly,
 * an alert is stored in MongoDB.
 */

router.post("/analyze", async (req, res) => {
  try {

    const { patientId, patientName, vitalType = 'HEART_RATE', value, heartRate, previousAverage = 90, unit } = req.body;

    if (!patientId) return res.status(400).json({ success: false, message: 'patientId is required' });
    if (!patientName) return res.status(400).json({ success: false, message: 'patientName is required' });

    const actualValue = value !== undefined ? value : heartRate;
    if (actualValue === undefined || actualValue === null || actualValue === '') {
      return res.status(400).json({ success: false, message: 'value is required' });
    }

    const analysis = analyzeTelemetry({
      vitalType,
      value: actualValue,
      previousAverage
    });

    if (!analysis.alert) {
      return res.status(200).json({
        success: true,
        alertCreated: false,
        patient: { id: String(patientId), name: String(patientName) },
        analysis
      });
    }

    const alertId = `ALT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const displayUnit = unit || (String(vitalType).toUpperCase() === 'SPO2' ? '%' : String(vitalType).toUpperCase() === 'TEMPERATURE' ? '°F' : String(vitalType).toUpperCase() === 'BLOOD_PRESSURE' ? 'mmHg' : 'bpm');
    const alertDocument = {
      alertId,
      patientId: String(patientId),
      patientName: String(patientName),
      vital: String(vitalType).toUpperCase() === 'SPO2' ? 'Blood Oxygen (SpO₂)' : String(vitalType).toUpperCase() === 'TEMPERATURE' ? 'Core Temperature' : String(vitalType).toUpperCase() === 'BLOOD_PRESSURE' ? 'Systolic Blood Pressure' : 'Heart Rate',
      value: `${Number(actualValue)} ${displayUnit}`,
      severity: analysis.severity,
      status: 'ACTIVE',
      message: analysis.message,
      notes: analysis.recommendedActions.join(' | '),
      detectedAt: new Date(analysis.detectedAt)
    };

    let savedAlert = alertDocument;
    if (mongoose.connection.readyState === 1) {
      try {
        savedAlert = await Alert.create(alertDocument);
      } catch (dbError) {
        memoryAlerts.unshift(alertDocument);
        memoryAlerts.splice(100);
        savedAlert = alertDocument;
        console.warn('MongoDB unavailable; stored alert in memory fallback.');
      }
    } else {
      memoryAlerts.unshift(alertDocument);
      memoryAlerts.splice(100);
      savedAlert = alertDocument;
      console.warn('MongoDB unavailable; stored alert in memory fallback.');
    }

    /*
     * -----------------------------
     * RETURN CREATED ALERT
     * -----------------------------
     */

    return res.status(201).json({

      success: true,

      alertCreated: true,

      patient: {
        id: String(patientId),
        name: String(patientName),
      },

      alert: savedAlert,

      analysis,
    });


  } catch (error) {

    console.error(
      "Real-Time Alert Engine Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Alert analysis failed",
    });
  }
});


/*
 * =========================================================
 * ACKNOWLEDGE ALERT
 * =========================================================
 *
 * PATCH /api/alerts/:alertId/acknowledge
 */

router.patch(
  "/:alertId/acknowledge",
  async (req, res) => {

    try {

      let alert;
      try {
        alert = await Alert.findOneAndUpdate(
          { alertId: req.params.alertId },
          { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() },
          { new: true }
        );
      } catch (dbError) {
        alert = memoryAlerts.find((item) => item.alertId === req.params.alertId);
        if (alert) { alert.status = 'ACKNOWLEDGED'; alert.acknowledgedAt = new Date(); }
      }

      if (!alert) {
        const fallback = memoryAlerts.find((item) => item.alertId === req.params.alertId);
        if (fallback) { fallback.status = 'ACKNOWLEDGED'; fallback.acknowledgedAt = new Date(); alert = fallback; }
      }


      if (!alert) {

        return res.status(404).json({
          success: false,
          message: "Alert not found",
        });
      }


      return res.status(200).json({
        success: true,
        alert,
      });


    } catch (error) {

      console.error(
        "Failed to acknowledge alert:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to acknowledge alert",
      });
    }
  }
);


/*
 * =========================================================
 * RESOLVE ALERT
 * =========================================================
 *
 * PATCH /api/alerts/:alertId/resolve
 */

router.patch(
  "/:alertId/resolve",
  async (req, res) => {

    try {

      let alert;
      try {
        alert = await Alert.findOneAndUpdate(
          { alertId: req.params.alertId },
          { status: 'RESOLVED', resolvedAt: new Date() },
          { new: true }
        );
      } catch (dbError) {
        alert = memoryAlerts.find((item) => item.alertId === req.params.alertId);
        if (alert) { alert.status = 'RESOLVED'; alert.resolvedAt = new Date(); }
      }

      if (!alert) {
        const fallback = memoryAlerts.find((item) => item.alertId === req.params.alertId);
        if (fallback) { fallback.status = 'RESOLVED'; fallback.resolvedAt = new Date(); alert = fallback; }
      }


      if (!alert) {

        return res.status(404).json({
          success: false,
          message: "Alert not found",
        });
      }


      return res.status(200).json({
        success: true,
        alert,
      });


    } catch (error) {

      console.error(
        "Failed to resolve alert:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to resolve alert",
      });
    }
  }
);


module.exports = router;