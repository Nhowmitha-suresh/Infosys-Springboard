const express = require("express");
const DiabetesPrediction = require("../models/DiabetesPrediction");
const mongoose = require("mongoose");

const router = express.Router();

/*
============================================================
DCR-NN2 - Diabetes Complication Risk Model
Milestone 2

Current implementation:
Clinical feature-based prototype risk engine.

Future implementation:
Replace calculateDiabetesRisk() with the trained
TensorFlow/Keras DCR-NN2 longitudinal neural network.

The API contract can remain unchanged.
============================================================
*/


/*
============================================================
MODEL INFORMATION
============================================================
*/

router.get("/model", (req, res) => {
  res.json({
    success: true,

    data: {
      modelId: "MOD-DIA-02",

      modelName:
        "Diabetes Complication Risk Model (DCR-NN2)",

      architecture:
        "Deep Neural Network / Longitudinal Sequence",

      purpose:
        "Assesses progressive microvascular and macrovascular complication timelines for type-2 diabetic patients.",

      status:
        "Prototype Integrated",

      benchmarkAccuracy:
        "Pending Validation",

      rocAuc:
        "N/A",

      modelVersion:
        "DCR-NN2-v0.1",

      features: [
        "HbA1c",
        "Fasting Blood Sugar",
        "eGFR",
        "Microalbuminuria",
        "Systolic BP",
        "Neuropathy Score"
      ]
    }
  });
});


/*
============================================================
DCR-NN2 PROTOTYPE RISK ENGINE
============================================================

This is intentionally transparent.

It DOES NOT claim to be a clinically validated neural
network. It provides a working Milestone-2 demonstration
until the actual trained DCR-NN2 model is integrated.
============================================================
*/

function calculateDiabetesRisk({
  hba1c,
  fastingBloodSugar,
  egfr,
  microalbuminuria,
  systolicBp,
  neuropathyScore
}) {

  let score = 0;

  const contributions = {};


  /*
  ----------------------------------------------------------
  HbA1c
  ----------------------------------------------------------
  */

  let hba1cContribution = 0;

  if (hba1c >= 9) {
    hba1cContribution = 25;
  } else if (hba1c >= 8) {
    hba1cContribution = 20;
  } else if (hba1c >= 7) {
    hba1cContribution = 14;
  } else if (hba1c >= 6.5) {
    hba1cContribution = 8;
  }

  score += hba1cContribution;

  contributions["HbA1c"] = hba1cContribution;


  /*
  ----------------------------------------------------------
  Fasting Blood Sugar
  ----------------------------------------------------------
  */

  let glucoseContribution = 0;

  if (fastingBloodSugar >= 180) {
    glucoseContribution = 18;
  } else if (fastingBloodSugar >= 140) {
    glucoseContribution = 14;
  } else if (fastingBloodSugar >= 126) {
    glucoseContribution = 10;
  } else if (fastingBloodSugar >= 100) {
    glucoseContribution = 5;
  }

  score += glucoseContribution;

  contributions["Fasting Blood Sugar"] =
    glucoseContribution;


  /*
  ----------------------------------------------------------
  eGFR
  Lower eGFR = higher renal complication concern
  ----------------------------------------------------------
  */

  let egfrContribution = 0;

  if (egfr < 30) {
    egfrContribution = 22;
  } else if (egfr < 45) {
    egfrContribution = 18;
  } else if (egfr < 60) {
    egfrContribution = 13;
  } else if (egfr < 90) {
    egfrContribution = 5;
  }

  score += egfrContribution;

  contributions["eGFR"] = egfrContribution;


  /*
  ----------------------------------------------------------
  Microalbuminuria
  ----------------------------------------------------------
  */

  let albuminContribution = 0;

  if (microalbuminuria >= 300) {
    albuminContribution = 20;
  } else if (microalbuminuria >= 100) {
    albuminContribution = 15;
  } else if (microalbuminuria >= 30) {
    albuminContribution = 9;
  }

  score += albuminContribution;

  contributions["Microalbuminuria"] =
    albuminContribution;


  /*
  ----------------------------------------------------------
  Systolic Blood Pressure
  ----------------------------------------------------------
  */

  let bpContribution = 0;

  if (systolicBp >= 160) {
    bpContribution = 15;
  } else if (systolicBp >= 140) {
    bpContribution = 12;
  } else if (systolicBp >= 130) {
    bpContribution = 8;
  } else if (systolicBp >= 120) {
    bpContribution = 4;
  }

  score += bpContribution;

  contributions["Systolic BP"] =
    bpContribution;


  /*
  ----------------------------------------------------------
  Neuropathy Score
  ----------------------------------------------------------
  */

  let neuropathyContribution = 0;

  if (neuropathyScore >= 8) {
    neuropathyContribution = 15;
  } else if (neuropathyScore >= 5) {
    neuropathyContribution = 12;
  } else if (neuropathyScore >= 3) {
    neuropathyContribution = 7;
  } else if (neuropathyScore > 0) {
    neuropathyContribution = 3;
  }

  score += neuropathyContribution;

  contributions["Neuropathy Score"] =
    neuropathyContribution;


  /*
  ----------------------------------------------------------
  Normalize score
  ----------------------------------------------------------
  */

  const maxScore = 115;

  let riskScore =
    Math.round(
      (score / maxScore) * 100
    );

  if (riskScore > 100) {
    riskScore = 100;
  }

  if (riskScore < 0) {
    riskScore = 0;
  }


  /*
  ----------------------------------------------------------
  Risk classification
  ----------------------------------------------------------
  */

  let riskLevel = "Low";

  if (riskScore >= 70) {
    riskLevel = "High";
  } else if (riskScore >= 40) {
    riskLevel = "Moderate";
  }


  /*
  ----------------------------------------------------------
  Microvascular risk
  ----------------------------------------------------------
  */

  let microvascularScore =
    egfrContribution +
    albuminContribution +
    neuropathyContribution +
    hba1cContribution;


  let microvascularRisk = "Low";

  if (microvascularScore >= 45) {
    microvascularRisk = "High";
  } else if (microvascularScore >= 25) {
    microvascularRisk = "Moderate";
  }


  /*
  ----------------------------------------------------------
  Macrovascular risk
  ----------------------------------------------------------
  */

  let macrovascularScore =
    glucoseContribution +
    bpContribution +
    hba1cContribution;


  let macrovascularRisk = "Low";

  if (macrovascularScore >= 35) {
    macrovascularRisk = "High";
  } else if (macrovascularScore >= 20) {
    macrovascularRisk = "Moderate";
  }


  /*
  ----------------------------------------------------------
  Recommendations
  ----------------------------------------------------------
  */

  const recommendations = [];


  if (hba1c >= 7) {
    recommendations.push(
      "Glycemic control requires clinical review."
    );
  }


  if (egfr < 60) {
    recommendations.push(
      "Renal function monitoring should be considered."
    );
  }


  if (microalbuminuria >= 30) {
    recommendations.push(
      "Albuminuria monitoring should be considered."
    );
  }


  if (systolicBp >= 130) {
    recommendations.push(
      "Blood pressure requires clinical monitoring."
    );
  }


  if (neuropathyScore >= 3) {
    recommendations.push(
      "Neuropathy assessment and follow-up should be considered."
    );
  }


  if (recommendations.length === 0) {
    recommendations.push(
      "Continue routine diabetes monitoring and follow-up."
    );
  }


  return {
    riskScore,

    riskLevel,

    microvascularRisk,

    macrovascularRisk,

    featureContributions:
      contributions,

    recommendations,

    modelType:
      "Prototype Clinical Risk Engine",

    modelVersion:
      "DCR-NN2-v0.1"
  };
}


/*
============================================================
PREDICTION API
============================================================
*/

router.post("/predict", async (req, res) => {

  try {

    const {
      patientId,
      patientName,
      hba1c,
      fastingBloodSugar,
      egfr,
      microalbuminuria,
      systolicBp,
      neuropathyScore
    } = req.body;


    /*
    ----------------------------------------------------------
    Required field validation
    ----------------------------------------------------------
    */

    const fields = {
      patientName,
      hba1c,
      fastingBloodSugar,
      egfr,
      microalbuminuria,
      systolicBp,
      neuropathyScore
    };


    const missingFields =
      Object.entries(fields)
        .filter(
          ([, value]) =>
            value === undefined ||
            value === null ||
            value === ""
        )
        .map(
          ([key]) => key
        );


    if (missingFields.length > 0) {

      return res.status(400).json({

        success: false,

        message:
          `Missing required fields: ${missingFields.join(", ")}`
      });

    }


    /*
    ----------------------------------------------------------
    Numeric validation
    ----------------------------------------------------------
    */

    const numericFields = [
      "hba1c",
      "fastingBloodSugar",
      "egfr",
      "microalbuminuria",
      "systolicBp",
      "neuropathyScore"
    ];


    const invalidFields =
      numericFields.filter(
        (field) =>
          !Number.isFinite(
            Number(req.body[field])
          )
      );


    if (invalidFields.length > 0) {

      return res.status(400).json({

        success: false,

        message:
          `Invalid numeric fields: ${invalidFields.join(", ")}`
      });

    }


    /*
    ----------------------------------------------------------
    Convert values to numbers
    ----------------------------------------------------------
    */

    const input = {

      hba1c:
        Number(hba1c),

      fastingBloodSugar:
        Number(fastingBloodSugar),

      egfr:
        Number(egfr),

      microalbuminuria:
        Number(microalbuminuria),

      systolicBp:
        Number(systolicBp),

      neuropathyScore:
        Number(neuropathyScore)

    };


    /*
    ----------------------------------------------------------
    Calculate risk
    ----------------------------------------------------------
    */

    const prediction =
      calculateDiabetesRisk(input);


    /*
    ----------------------------------------------------------
    Store assessment in MongoDB
    ----------------------------------------------------------
    */

    let record = null;
    if (mongoose.connection.readyState === 1) {
      try {
        record = await DiabetesPrediction.create({

        patientId,

        patientName,

        hba1c:
          input.hba1c,

        fastingBloodSugar:
          input.fastingBloodSugar,

        egfr:
          input.egfr,

        microalbuminuria:
          input.microalbuminuria,

        systolicBp:
          input.systolicBp,

        neuropathyScore:
          input.neuropathyScore,

        riskScore:
          prediction.riskScore,

        riskLevel:
          prediction.riskLevel,

        timestamp:
          new Date()

        });
      } catch (dbError) {
        console.warn('Diabetes prediction persistence unavailable; returning calculated result:', dbError.message);
      }
    } else {
      console.warn('MongoDB is not connected; returning diabetes prediction without persistence.');
    }


    /*
    ----------------------------------------------------------
    Return result to frontend
    ----------------------------------------------------------
    */

    return res.json({

      success: true,

      data: {

        recordId:
          record?._id || null,

        patientId,

        patientName,

        modelId:
          "MOD-DIA-02",

        modelName:
          "Diabetes Complication Risk Model (DCR-NN2)",

        modelVersion:
          prediction.modelVersion,

        architecture:
          "Deep Neural Network / Longitudinal Sequence",

        riskScore:
          prediction.riskScore,

        riskLevel:
          prediction.riskLevel,

        microvascularRisk:
          prediction.microvascularRisk,

        macrovascularRisk:
          prediction.macrovascularRisk,

        featureContributions:
          prediction.featureContributions,

        recommendations:
          prediction.recommendations,

        status:
          "Prototype Prediction Generated",

        validationStatus:
          "Pending Clinical Validation"

      }

    });

  } catch (error) {

    console.error(
      "DCR-NN2 prediction error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server error occurred while calculating diabetes complication risk.",

      error:
        error.message

    });

  }

});


/*
============================================================
PREDICTION HISTORY
============================================================
*/

router.get("/history", async (req, res) => {

  try {

    const filter =
      req.query.patientId
        ? {
            patientId:
              req.query.patientId
          }
        : {};


    const history =
      await DiabetesPrediction
        .find(filter)
        .sort({
          timestamp: -1
        })
        .limit(50);


    return res.json({

      success: true,

      data:
        history

    });

  } catch (error) {

    console.error(
      "DCR-NN2 history error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch diabetes prediction history.",

      error:
        error.message

    });

  }

});


module.exports = router;