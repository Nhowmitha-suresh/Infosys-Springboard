
const express = require("express");
const mongoose = require("mongoose");

const AdherenceRecord = require("../models/AdherenceRecord");
const Careplan = require("../models/Careplan");
const Patient = require("../models/Patient");

const router = express.Router();

/*
============================================================
HELPER
RESOLVE PATIENT
============================================================

Handles patient IDs such as:

P101
P-101

P1006
P-1006

This prevents mismatch between frontend and MongoDB IDs.
============================================================
*/

async function findPatient(patientId) {
  const requestedId = String(patientId).trim();

  /*
  ----------------------------------------------------------
  1. Try exact ID first
  ----------------------------------------------------------
  */

  let patient = await Patient.findOne({
    id: requestedId,
  });

  if (patient) {
    return patient;
  }

  /*
  ----------------------------------------------------------
  2. Try ID without hyphen
  ----------------------------------------------------------
  */

  const normalizedId = requestedId.replace(/-/g, "");

  patient = await Patient.findOne({
    id: normalizedId,
  });

  if (patient) {
    return patient;
  }

  /*
  ----------------------------------------------------------
  3. Try ID with optional hyphen
  ----------------------------------------------------------
  */

  const match = normalizedId.match(/^([A-Za-z]+)(\d+)$/);

  if (match) {
    const prefix = match[1];
    const number = match[2];

    const idPattern = new RegExp(
      `^${prefix}-?${number}$`,
      "i"
    );

    patient = await Patient.findOne({
      id: idPattern,
    });
  }

  return patient || null;
}


/*
============================================================
HELPER
CREATE DEFAULT TASKS
============================================================
*/

function createDefaultTasks(patientId, patient) {
  const tasks = [];

  /*
  ----------------------------------------------------------
  MEDICATION
  ----------------------------------------------------------
  */

  if (
    patient &&
    Array.isArray(patient.medications) &&
    patient.medications.length > 0
  ) {
    tasks.push({
      taskId: `med-${patientId}`,
      title: "Follow prescribed medication plan",
      category: "Medication",
      frequency: "Daily",
      instructions:
        "Record whether the prescribed medication plan was followed.",
      active: true,
    });
  } else {
    /*
    Add medication task even when medication information
    is unavailable, so every patient gets the same structure.
    */

    tasks.push({
      taskId: `med-${patientId}`,
      title: "Follow prescribed medication plan",
      category: "Medication",
      frequency: "Daily",
      instructions:
        "Record whether the prescribed medication plan was followed.",
      active: true,
    });
  }

  /*
  ----------------------------------------------------------
  BLOOD PRESSURE
  ----------------------------------------------------------
  */

  tasks.push({
    taskId: `bp-${patientId}`,
    title: "Blood pressure monitoring",
    category: "Vital Monitoring",
    frequency: "Daily",
    instructions:
      "Record blood pressure readings according to the careplan.",
    active: true,
  });

  /*
  ----------------------------------------------------------
  GLUCOSE
  ----------------------------------------------------------
  */

  tasks.push({
    taskId: `glucose-${patientId}`,
    title: "Glucose monitoring",
    category: "Glucose Monitoring",
    frequency: "Daily",
    instructions:
      "Record glucose monitoring activity according to the careplan.",
    active: true,
  });

  /*
  ----------------------------------------------------------
  LIFESTYLE
  ----------------------------------------------------------
  */

  tasks.push({
    taskId: `lifestyle-${patientId}`,
    title: "Follow recommended lifestyle activities",
    category: "Lifestyle",
    frequency: "Daily",
    instructions:
      "Record completion of recommended lifestyle activities.",
    active: true,
  });

  /*
  ----------------------------------------------------------
  FOLLOW-UP
  ----------------------------------------------------------
  */

  tasks.push({
    taskId: `followup-${patientId}`,
    title: "Clinical follow-up",
    category: "Follow-up",
    frequency: "As scheduled",
    instructions:
      "Record completion of recommended clinical follow-up.",
    active: true,
  });

  return tasks;
}


/*
============================================================
HELPER
CREATE CAREPLAN AUTOMATICALLY WHEN MISSING
============================================================
*/

async function createCareplanIfMissing(patientId) {
  const requestedId = String(patientId).trim();

  /*
  ----------------------------------------------------------
  STEP 1
  Find patient using flexible ID matching
  ----------------------------------------------------------
  */

  const patient = await findPatient(requestedId);

  /*
  ----------------------------------------------------------
  Use the real MongoDB patient ID whenever available
  ----------------------------------------------------------
  */

  const actualPatientId = patient
    ? String(patient.id)
    : requestedId;

  /*
  ----------------------------------------------------------
  STEP 2
  Check whether careplan already exists
  ----------------------------------------------------------
  */

  let careplan = await Careplan.findOne({
    patientId: actualPatientId,
  }).sort({
    createdAt: -1,
  });

  if (careplan) {
    return careplan;
  }

  /*
  ----------------------------------------------------------
  STEP 3
  If exact careplan doesn't exist, also check requested ID
  ----------------------------------------------------------
  */

  if (actualPatientId !== requestedId) {
    careplan = await Careplan.findOne({
      patientId: requestedId,
    }).sort({
      createdAt: -1,
    });

    if (careplan) {
      return careplan;
    }
  }

  /*
  ----------------------------------------------------------
  STEP 4
  If patient does not exist at all
  ----------------------------------------------------------
  */

  if (!patient) {
    console.warn(
      `Patient ${requestedId} was not found in Patient collection. Creating fallback careplan.`
    );

    /*
    --------------------------------------------------------
    Create fallback careplan using requested patient ID.
    This prevents the dashboard from showing:
    "Patient not found. Unable to create careplan."
    --------------------------------------------------------
    */

    const fallbackTasks =
      createDefaultTasks(
        requestedId,
        null
      );

    careplan = await Careplan.create({
      patientId: requestedId,

      patientName:
        "Patient " + requestedId,

      generatedAt: new Date(),

      sourceData: {
        cvdRisk: null,
        diabetesRisk: "Unknown",
        systolicBp: null,
        diastolicBp: null,
        hba1c: null,
        alertCount: 0,
      },

      goals: [
        {
          title: "Maintain current health status",
          target:
            "Continue routine monitoring and follow-up",
          reason:
            "Default careplan created for adherence tracking.",
          interventions: [
            "Continue routine monitoring",
            "Follow the prescribed care plan",
            "Attend scheduled follow-up",
          ],
        },
      ],

      tasks: fallbackTasks,

      predictedOutcome: {
        metric: "Clinical Monitoring",
        currentValue: null,
        projectedValue: null,
        note:
          "Continue monitoring patient progress against the careplan.",
      },

      status: "Draft",

      guidelineStatus: "Not Validated",
    });

    return careplan;
  }

  /*
  ----------------------------------------------------------
  STEP 5
  Patient exists → create proper careplan
  ----------------------------------------------------------
  */

  const tasks =
    createDefaultTasks(
      actualPatientId,
      patient
    );

  careplan = await Careplan.create({
    patientId: actualPatientId,

    patientName:
      patient.name || "Unknown Patient",

    generatedAt: new Date(),

    sourceData: {
      cvdRisk: null,
      diabetesRisk: "Unknown",
      systolicBp: null,
      diastolicBp: null,
      hba1c: null,
      alertCount: 0,
    },

    goals: [
      {
        title: "Maintain current health status",
        target:
          "Continue routine monitoring and follow-up",
        reason:
          "Default careplan created automatically for adherence tracking.",
        interventions: [
          "Continue routine monitoring",
          "Follow the prescribed care plan",
          "Attend scheduled follow-up",
        ],
      },
    ],

    tasks,

    predictedOutcome: {
      metric: "Clinical Monitoring",
      currentValue: null,
      projectedValue: null,
      note:
        "Continue monitoring patient progress against the careplan.",
    },

    status: "Draft",

    guidelineStatus: "Not Validated",
  });

  console.log(
    `Automatic careplan created for ${patient.name} (${actualPatientId})`
  );

  return careplan;
}


/*
============================================================
GET ADHERENCE DATA FOR PATIENT
============================================================

GET /api/adherence/:patientId

If careplan is missing:
→ automatically creates one.
============================================================
*/

router.get("/:patientId", async (req, res) => {
  try {
    const requestedPatientId =
      String(req.params.patientId).trim();

    /*
    --------------------------------------------------------
    Find actual patient
    --------------------------------------------------------
    */

    const patient =
      await findPatient(
        requestedPatientId
      );

    /*
    --------------------------------------------------------
    Resolve canonical patient ID
    --------------------------------------------------------
    */

    const actualPatientId = patient
      ? String(patient.id)
      : requestedPatientId;

    /*
    --------------------------------------------------------
    Find OR create careplan
    --------------------------------------------------------
    */

    const careplan =
      await createCareplanIfMissing(
        requestedPatientId
      );

    if (!careplan) {
      return res.status(404).json({
        success: false,
        message:
          "Unable to create careplan for this patient.",
      });
    }

    /*
    --------------------------------------------------------
    Get adherence records
    --------------------------------------------------------
    */

    const records =
      await AdherenceRecord.find({
        patientId: {
          $in: [
            requestedPatientId,
            actualPatientId,
          ],
        },
        careplanId: careplan._id,
      }).sort({
        date: -1,
      });

    /*
    --------------------------------------------------------
    Calculate summary
    --------------------------------------------------------
    */

    const completed =
      records.filter(
        (record) =>
          record.status === "completed"
      ).length;

    const missed =
      records.filter(
        (record) =>
          record.status === "missed"
      ).length;

    const totalRecorded =
      records.length;

    const overallAdherence =
      totalRecorded > 0
        ? Math.round(
            (completed /
              totalRecorded) *
              100
          )
        : 0;

    /*
    --------------------------------------------------------
    Category statistics
    --------------------------------------------------------
    */

    const categories = [
      "Medication",
      "Vital Monitoring",
      "Glucose Monitoring",
      "Lifestyle",
      "Follow-up",
    ];

    const categoryStats = {};

    categories.forEach(
      (category) => {
        const categoryRecords =
          records.filter(
            (record) =>
              record.category ===
              category
          );

        const categoryCompleted =
          categoryRecords.filter(
            (record) =>
              record.status ===
              "completed"
          ).length;

        categoryStats[category] =
          categoryRecords.length > 0
            ? Math.round(
                (categoryCompleted /
                  categoryRecords.length) *
                  100
              )
            : 0;
      }
    );

    /*
    --------------------------------------------------------
    SUCCESS RESPONSE
    --------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      data: {
        patientId:
          actualPatientId,

        patientName:
          patient?.name ||
          careplan.patientName ||
          "Unknown Patient",

        careplanId:
          String(careplan._id),

        careplanStatus:
          careplan.status ||
          "Draft",

        tasks:
          Array.isArray(
            careplan.tasks
          )
            ? careplan.tasks
            : [],

        records,

        summary: {
          totalRecorded,
          completed,
          missed,
          overallAdherence,
        },

        categoryStats,
      },
    });
  } catch (error) {
    console.error(
      "Adherence GET error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch adherence data.",
      error: error.message,
    });
  }
});


/*
============================================================
POST ADHERENCE RECORD
============================================================

POST /api/adherence
============================================================
*/

router.post("/", async (req, res) => {
  try {
    const {
      patientId,
      careplanId,
      taskId,
      date,
      status,
      notes,
    } = req.body;

    if (
      !patientId ||
      !careplanId ||
      !taskId ||
      !date ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "patientId, careplanId, taskId, date and status are required.",
      });
    }

    if (
      !["completed", "missed"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be either completed or missed.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        careplanId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid careplanId.",
      });
    }

    const careplan =
      await Careplan.findById(
        careplanId
      );

    if (!careplan) {
      return res.status(404).json({
        success: false,
        message:
          "Careplan not found.",
      });
    }

    /*
    --------------------------------------------------------
    Allow equivalent IDs:
    P101 ↔ P-101
    --------------------------------------------------------
    */

    const storedPatientId =
      String(careplan.patientId)
        .replace(/-/g, "")
        .toLowerCase();

    const requestedPatientId =
      String(patientId)
        .replace(/-/g, "")
        .toLowerCase();

    if (
      storedPatientId !==
      requestedPatientId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Careplan does not belong to this patient.",
      });
    }

    const tasks =
      Array.isArray(
        careplan.tasks
      )
        ? careplan.tasks
        : [];

    const task =
      tasks.find(
        (item) =>
          String(item.taskId) ===
          String(taskId)
      );

    if (!task) {
      return res.status(404).json({
        success: false,
        message:
          "Task not found in the selected careplan.",
      });
    }

    const recordDate =
      new Date(date);

    if (
      Number.isNaN(
        recordDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid date.",
      });
    }

    /*
    --------------------------------------------------------
    Find existing record for same day
    --------------------------------------------------------
    */

    const startOfDay =
      new Date(recordDate);

    startOfDay.setHours(
      0,
      0,
      0,
      0
    );

    const endOfDay =
      new Date(recordDate);

    endOfDay.setHours(
      23,
      59,
      59,
      999
    );

    let record =
      await AdherenceRecord.findOne({
        careplanId:
          careplan._id,

        taskId:
          String(taskId),

        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

    /*
    --------------------------------------------------------
    UPDATE EXISTING RECORD
    --------------------------------------------------------
    */

    if (record) {
      record.status = status;
      record.notes = notes || "";

      await record.save();

      return res.status(200).json({
        success: true,
        message:
          "Adherence record updated successfully.",
        data: record,
      });
    }

    /*
    --------------------------------------------------------
    CREATE NEW RECORD
    --------------------------------------------------------
    */

    record =
      await AdherenceRecord.create({
        patientId:
          String(careplan.patientId),

        careplanId:
          careplan._id,

        taskId:
          String(taskId),

        task:
          task.title ||
          task.task ||
          task.name ||
          "Careplan Task",

        category:
          task.category ||
          "Follow-up",

        date: recordDate,

        status,

        notes: notes || "",
      });

    return res.status(201).json({
      success: true,
      message:
        "Adherence record created successfully.",
      data: record,
    });
  } catch (error) {
    console.error(
      "Adherence POST error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to save adherence record.",
      error: error.message,
    });
  }
});


/*
============================================================
DELETE ADHERENCE RECORD
============================================================

DELETE /api/adherence/record/:recordId
============================================================
*/

router.delete(
  "/record/:recordId",
  async (req, res) => {
    try {
      const { recordId } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          recordId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid adherence record ID.",
        });
      }

      const record =
        await AdherenceRecord.findByIdAndDelete(
          recordId
        );

      if (!record) {
        return res.status(404).json({
          success: false,
          message:
            "Adherence record not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Adherence record deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Adherence DELETE error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete adherence record.",
        error: error.message,
      });
    }
  }
);


module.exports = router;

