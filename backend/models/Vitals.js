const mongoose = require("mongoose");

const vitalsSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  heartRate: {
    type: Number,
    required: true
  },
  bloodPressure: {
    systolic: { type: Number, required: true },
    diastolic: { type: Number, required: true }
  },
  spo2: {
    type: Number,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Vitals", vitalsSchema);
