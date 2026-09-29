const mongoose = require("mongoose");

const cvdPredictionSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: false
  },
  patientName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  systolicBp: {
    type: Number,
    required: true
  },
  diastolicBp: {
    type: Number,
    required: true
  },
  cholesterol: {
    type: Number,
    required: true
  },
  heartRate: {
    type: Number,
    required: true
  },
  bmi: {
    type: Number,
    required: true
  },
  diabetes: {
    type: Boolean,
    required: true
  },
  riskScore: {
    type: Number,
    required: true
  },
  riskLevel: {
    type: String,
    required: true
  },
  shapExplanation: {
    type: Map,
    of: Number,
    default: {}
  },
  recommendations: {
    type: [String],
    default: []
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("CvdPrediction", cvdPredictionSchema);
