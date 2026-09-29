const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    patientId: {
      type: String,
      required: true,
      index: true,
    },

    patientName: {
      type: String,
      required: true,
    },

    vital: {
      type: String,
      required: true,
    },

    value: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: ["HIGH", "MEDIUM", "NORMAL"],
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "ACKNOWLEDGED", "RESOLVED"],
      default: "ACTIVE",
      index: true,
    },

    message: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    detectedAt: {
      type: Date,
      default: Date.now,
    },

    acknowledgedAt: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Alert", alertSchema);