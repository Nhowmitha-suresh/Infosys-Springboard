const mongoose = require("mongoose");

const adherenceRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },

    careplanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Careplan",
      required: true,
      index: true,
    },

    taskId: {
      type: String,
      required: true,
    },

    task: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Medication",
        "Vital Monitoring",
        "Glucose Monitoring",
        "Lifestyle",
        "Follow-up",
      ],
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["completed", "missed"],
      required: true,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

adherenceRecordSchema.index({
  patientId: 1,
  careplanId: 1,
  taskId: 1,
  date: 1,
});

module.exports = mongoose.model(
  "AdherenceRecord",
  adherenceRecordSchema
);