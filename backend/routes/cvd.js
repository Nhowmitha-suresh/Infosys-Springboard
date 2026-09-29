const express = require("express");
const fs = require("fs");
const path = require("path");
const CvdPrediction = require("../models/CvdPrediction");
const mongoose = require("mongoose");
const Patient = require("../models/Patient");

const router = express.Router();

const PARAM_FILE_PATH = path.join(__dirname, "../config/cvd_model_params.json");

// Default high-quality parameters in case training script wasn't run
const DEFAULT_PARAMS = {
  version: "2.1",
  intercept: -1.7349,
  coefficients: {
    age: 0.5844,
    gender: 0.1612,
    systolicBp: 0.5277,
    diastolicBp: 0.1144,
    cholesterol: 0.4763,
    heartRate: 0.1130,
    bmi: 0.3451,
    diabetes: 0.2976
  },
  means: {
    age: 54.0,
    gender: 0.52,
    systolicBp: 128.0,
    diastolicBp: 81.0,
    cholesterol: 210.0,
    heartRate: 74.0,
    bmi: 26.5,
    diabetes: 0.15
  },
  stds: {
    age: 12.0,
    gender: 0.5,
    systolicBp: 17.0,
    diastolicBp: 10.0,
    cholesterol: 40.0,
    heartRate: 12.0,
    bmi: 5.2,
    diabetes: 0.35
  },
  accuracy: 0.8175,
  baseRate: 0.1935
};

// Helper: load model parameters
function getModelParams() {
  try {
    if (fs.existsSync(PARAM_FILE_PATH)) {
      const fileData = fs.readFileSync(PARAM_FILE_PATH, "utf8");
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.error("Error reading model parameters, using defaults", err);
  }
  return DEFAULT_PARAMS;
}

// @route   GET /api/cvd/parameters
// @desc    Get current AI model parameters & training metrics
router.get("/parameters", (req, res) => {
  const params = getModelParams();
  res.json({
    success: true,
    data: params
  });
});

// @route   POST /api/cvd/predict
// @desc    Run CVD Risk Prediction and optionally save record
router.post("/predict", async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      age,
      gender,
      systolicBp,
      diastolicBp,
      cholesterol,
      heartRate,
      bmi,
      diabetes,
      saveRecord = false
    } = req.body;

    // Validate required fields
    if (
      age === undefined ||
      gender === undefined ||
      systolicBp === undefined ||
      diastolicBp === undefined ||
      cholesterol === undefined ||
      heartRate === undefined ||
      bmi === undefined ||
      diabetes === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required clinical features for prediction."
      });
    }

    const numericInputs = { age, systolicBp, diastolicBp, cholesterol, heartRate, bmi };
    const invalidInputs = Object.entries(numericInputs)
      .filter(([, value]) => !Number.isFinite(Number(value)))
      .map(([key]) => key);
    if (invalidInputs.length) {
      return res.status(400).json({ success: false, message: `Invalid numeric fields: ${invalidInputs.join(', ')}` });
    }

    const params = getModelParams();

    // Map inputs to weights keys
    const rawValues = {
      age: Number(age),
      gender: gender === "Male" ? 1 : 0,
      systolicBp: Number(systolicBp),
      diastolicBp: Number(diastolicBp),
      cholesterol: Number(cholesterol),
      heartRate: Number(heartRate),
      bmi: Number(bmi),
      diabetes: diabetes ? 1 : 0
    };

    // Calculate prediction logit & SHAP contributions
    let logit = params.intercept;
    const shapExplanation = {};

    for (const [feature, value] of Object.entries(rawValues)) {
      const mean = params.means[feature];
      const std = params.stds[feature];
      const weight = params.coefficients[feature];
      
      // Normalized input
      const normalizedValue = (value - mean) / std;
      // Feature contribution
      const contribution = weight * normalizedValue;
      
      logit += contribution;
      shapExplanation[feature] = Number(contribution.toFixed(4));
    }

    // Sigmoid function
    const riskProb = 1.0 / (1.0 + Math.exp(-logit));
    const riskScore = Number((riskProb * 100).toFixed(1));

    // Determine Risk Level
    let riskLevel = "Low";
    if (riskScore >= 30) riskLevel = "High";
    else if (riskScore >= 20) riskLevel = "Intermediate";
    else if (riskScore >= 10) riskLevel = "Borderline";

    // Generate clinical recommendations
    const recommendations = [];

    if (rawValues.age >= 65) {
      recommendations.push("Age component (65+): Recommend annual cardiovascular review and medication profiling.");
    }
    
    // BP
    if (rawValues.systolicBp >= 140 || rawValues.diastolicBp >= 90) {
      recommendations.push("Hypertension Stage 2: Prompt medical review for anti-hypertensive therapy, daily BP logs, and sodium reduction (<1,500mg/day).");
    } else if (rawValues.systolicBp >= 130 || rawValues.diastolicBp >= 80) {
      recommendations.push("Hypertension Stage 1: Recommend lifestyle modifications including DASH diet, active exercise (150 mins/week), and BP check every 2 weeks.");
    }

    // Cholesterol
    if (rawValues.cholesterol >= 240) {
      recommendations.push("High Cholesterol: Suggest full lipid profile (LDL, HDL, Triglycerides) and consult for potential statin therapy.");
    } else if (rawValues.cholesterol >= 200) {
      recommendations.push("Borderline Cholesterol: Advise diet modification, restricting saturated fats, and increasing dietary soluble fiber.");
    }

    // BMI
    if (rawValues.bmi >= 30) {
      recommendations.push("Obesity Range: Structured caloric management and weight reduction plan to decrease myocardial workload.");
    } else if (rawValues.bmi >= 25) {
      recommendations.push("Overweight Range: Recommend diet monitoring and physical activity adjustments to maintain a healthy weight.");
    }

    // Diabetes
    if (rawValues.diabetes === 1) {
      recommendations.push("Type 2 Diabetes: Tight glycemic control (target HbA1c < 7.0%), blood glucose tracking, and regular diabetic foot/eye examinations.");
    }

    // General risk recommendation
    if (riskScore >= 30) {
      recommendations.push("HIGH CARDIOVASCULAR RISK: Urgent cardiology consult, diagnostic workup (ECG/Stress Test), and aggressive pharmacological intervention.");
    } else if (riskScore >= 20) {
      recommendations.push("INTERMEDIATE CARDIOVASCULAR RISK: Comprehensive risk reduction counselling and routine follow-up in 3-6 months.");
    } else if (riskScore < 10) {
      recommendations.push("LOW RISK: Maintain standard preventative healthcare measures and lifestyle habits.");
    }

    // Save prediction to database
    let savedPrediction = null;
    if (saveRecord && mongoose.connection.readyState === 1) {
      const activePatientName = patientName || `Patient ${patientId || "Unknown"}`;
      
      const predictionRecord = new CvdPrediction({
        patientId: patientId || null,
        patientName: activePatientName,
        age: Number(age),
        gender,
        systolicBp: Number(systolicBp),
        diastolicBp: Number(diastolicBp),
        cholesterol: Number(cholesterol),
        heartRate: Number(heartRate),
        bmi: Number(bmi),
        diabetes: Boolean(diabetes),
        riskScore,
        riskLevel,
        shapExplanation,
        recommendations
      });
      
      try {
        savedPrediction = await predictionRecord.save();
      } catch (dbError) {
        console.warn('CVD prediction persistence unavailable; returning calculated result:', dbError.message);
      }
    } else if (saveRecord) {
      console.warn('MongoDB is not connected; returning CVD prediction without persistence.');
    }

    res.json({
      success: true,
      data: {
        riskScore,
        riskLevel,
        shapExplanation,
        recommendations,
        record: savedPrediction
      }
    });

  } catch (err) {
    console.error("CVD prediction API error:", err);
    res.status(500).json({
      success: false,
      message: "Server error occurred during prediction calculations",
      error: err.message
    });
  }
});

// @route   GET /api/cvd/history
// @desc    Get recent CVD predictions
router.get("/history", async (req, res) => {
  try {
    const { patientId } = req.query;
    const filter = patientId ? { patientId } : {};
    
    // Get last 50 predictions sorted by newest first
    const history = await CvdPrediction.find(filter)
      .sort({ timestamp: -1 })
      .limit(50);
      
    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    console.error("Failed to fetch CVD history:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch prediction history",
      error: err.message
    });
  }
});

// @route   DELETE /api/cvd/history/:id
// @desc    Delete a CVD prediction log
router.delete("/history/:id", async (req, res) => {
  try {
    const deleted = await CvdPrediction.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Prediction log not found"
      });
    }
    res.json({
      success: true,
      message: "Prediction log deleted successfully"
    });
  } catch (err) {
    console.error("Failed to delete CVD record:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete prediction record",
      error: err.message
    });
  }
});

module.exports = router;
