const mongoose = require("mongoose");

const labResultSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  labResults: [
    {
      testName: { type: String, required: true },
      value: { type: Number, required: true },
      unit: { type: String, required: true },
      date: { type: String, required: true }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model("LabResult", labResultSchema);
