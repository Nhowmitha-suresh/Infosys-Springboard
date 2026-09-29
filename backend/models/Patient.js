const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  age: {
    type: Number
  },
  gender: {
    type: String
  },
  bloodGroup: {
    type: String
  },
  hospital: {
    type: String
  },
  assignedDoctor: {
    type: String
  },
  doctorEmail: {
    type: String
  },
  phone: {
    type: String
  },
  conditions: {
    type: [String],
    default: []
  },
  medications: {
    type: [String],
    default: []
  },
  allergies: {
    type: String
  },
  insurance: {
    type: String
  },
  emergencyContact: {
    type: String
  },
  vitals: {
    hr: { type: Number },
    bp: { type: String },
    spo2: { type: Number },
    temp: { type: String },
    resp: { type: Number }
  },
  labResults: {
    hba1c: { type: String },
    egfr: { type: String },
    ldl: { type: String }
  },
  twinCompleteness: {
    type: Number,
    default: 85
  },
  onboardedDate: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Patient", patientSchema);
