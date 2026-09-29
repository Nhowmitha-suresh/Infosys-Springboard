const mongoose = require("mongoose");

const DiabetesPredictionSchema =
  new mongoose.Schema(
    {

      patientId: {
        type: String,
        default: null
      },

      patientName: {
        type: String,
        required: true
      },

      hba1c: {
        type: Number,
        required: true
      },

      fastingBloodSugar: {
        type: Number,
        required: true
      },

      egfr: {
        type: Number,
        required: true
      },

      microalbuminuria: {
        type: Number,
        required: true
      },

      systolicBp: {
        type: Number,
        required: true
      },

      neuropathyScore: {
        type: Number,
        required: true
      },

      riskScore: {
        type: Number,
        default: null
      },

      riskLevel: {
        type: String,
        default: "Pending"
      },

      timestamp: {
        type: Date,
        default: Date.now
      }

    },
    {
      collection: "diabetes_predictions"
    }
  );


module.exports =
  mongoose.model(
    "DiabetesPrediction",
    DiabetesPredictionSchema
  );