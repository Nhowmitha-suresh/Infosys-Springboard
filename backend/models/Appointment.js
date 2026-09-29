const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  symptoms: {
    type: String
  },
  status: {
    type: String,
    default: "Pending"
  },
  notes: {
    type: String
  },
  type: {
    type: String,
    default: "Outpatient Consultation"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Appointment", appointmentSchema);
