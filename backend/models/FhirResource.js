const mongoose = require("mongoose");

const fhirResourceSchema = new mongoose.Schema({
  resourceType: {
    type: String,
    required: true
  },
  resourceId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  validationStatus: {
    type: String,
    required: true
  },
  receivedAt: {
    type: String,
    required: true
  },
  resource: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("FhirResource", fhirResourceSchema);
