const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
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
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  specialization: {
    type: String
  },
  experience: {
    type: String
  },
  phone: {
    type: String
  },
  rating: {
    type: String,
    default: "5.0"
  },
  availability: {
    type: String,
    default: "Mon - Fri (09:00 - 17:00)"
  },
  status: {
    type: String,
    default: "Available"
  },
  patientsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Doctor", doctorSchema);
