const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
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
  role: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  shift: {
    type: String,
    default: "Day Shift"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Employee", employeeSchema);
