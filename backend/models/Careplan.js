const mongoose = require("mongoose");

const careplanTaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
    },

    title: {
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

    frequency: {
      type: String,
      default: "Daily",
    },

    instructions: {
      type: String,
      default: "",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const careplanGoalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    target: {
      type: String,
      default: "",
    },

    reason: {
      type: String,
      default: "",
    },

    interventions: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const careplanSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },

    patientName: {
      type: String,
      required: true,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },

    sourceData: {
      cvdRisk: {
        type: Number,
        default: null,
      },

      diabetesRisk: {
        type: String,
        default: "Unknown",
      },

      systolicBp: {
        type: Number,
        default: null,
      },

      diastolicBp: {
        type: Number,
        default: null,
      },

      hba1c: {
        type: Number,
        default: null,
      },

      alertCount: {
        type: Number,
        default: 0,
      },
    },

    goals: {
      type: [careplanGoalSchema],
      default: [],
    },

    tasks: {
      type: [careplanTaskSchema],
      default: [],
    },

    predictedOutcome: {
      metric: {
        type: String,
        default: "CVD Risk",
      },

      currentValue: {
        type: Number,
        default: null,
      },

      projectedValue: {
        type: Number,
        default: null,
      },

      note: {
        type: String,
        default: "",
      },
    },

    status: {
      type: String,
      enum: ["Draft", "Under Review", "Approved", "Active", "Completed"],
      default: "Draft",
    },

    guidelineStatus: {
      type: String,
      enum: ["Not Validated", "Compliant", "Review Required"],
      default: "Not Validated",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Careplan", careplanSchema);