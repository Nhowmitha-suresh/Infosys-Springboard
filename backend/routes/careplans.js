const express = require("express");
const { randomUUID } = require("crypto");

const Patient = require("../models/Patient");
const Vitals = require("../models/Vitals");
const LabResult = require("../models/LabResult");
const CvdPrediction = require("../models/CvdPrediction");
const DiabetesPrediction = require("../models/DiabetesPrediction");
const Alert = require("../models/Alert");
const Careplan = require("../models/Careplan");

const router = express.Router();

/*
============================================================
HELPERS
============================================================
*/

function toNumber(value) {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
}

function parseBloodPressure(bp) {
    if (!bp || typeof bp !== "string") {
        return {
            systolic: null,
            diastolic: null
        };
    }

    const parts = bp.split("/");

    if (parts.length !== 2) {
        return {
            systolic: null,
            diastolic: null
        };
    }

    return {
        systolic: toNumber(parts[0]),
        diastolic: toNumber(parts[1])
    };
}

/*
============================================================
GET PATIENTS
============================================================

GET /api/careplans/patients
============================================================
*/

router.get("/patients", async (req, res) => {
    try {

        const patients = await Patient.find({})
            .select(
                "id name age gender bloodGroup conditions medications allergies hospital assignedDoctor"
            )
            .sort({ id: 1 });

        return res.status(200).json({
            success: true,
            data: patients
        });

    } catch (error) {

        console.error(
            "Failed to fetch careplan patients:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch patients for careplan generation.",
            error: error.message
        });
    }
});

/*
============================================================
GET ALL CAREPLANS
============================================================
*/

router.get("/", async (req, res) => {
    try {

        const filter = {};

        if (req.query.patientId) {
            filter.patientId = String(req.query.patientId);
        }

        const careplans = await Careplan.find(filter)
            .sort({ createdAt: -1 })
            .limit(100);

        return res.status(200).json({
            success: true,
            data: careplans
        });

    } catch (error) {

        console.error(
            "Failed to fetch careplans:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch careplans.",
            error: error.message
        });
    }
});

/*
============================================================
GET CAREPLAN BY ID
============================================================
*/

router.get("/:careplanId", async (req, res) => {
    try {

        const careplan =
            await Careplan.findById(
                req.params.careplanId
            );

        if (!careplan) {
            return res.status(404).json({
                success: false,
                message: "Careplan not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: careplan
        });

    } catch (error) {

        console.error(
            "Failed to fetch careplan:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch careplan.",
            error: error.message
        });
    }
});

/*
============================================================
GENERATE / REGENERATE CAREPLAN
============================================================

POST /api/careplans/generate

Body:

{
    "patientId": "P-101"
}

IMPORTANT:
One patient = one current careplan.

If a careplan already exists for the patient,
it will be updated instead of creating duplicates.
============================================================
*/

router.post("/generate", async (req, res) => {

    try {

        const { patientId } = req.body;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "patientId is required."
            });
        }

        const normalizedPatientId =
            String(patientId).trim();

        /*
        ----------------------------------------------------
        GET PATIENT
        ----------------------------------------------------
        */

        const patient =
            await Patient.findOne({
                id: normalizedPatientId
            });

        if (!patient) {

            return res.status(404).json({
                success: false,
                message:
                    `Patient not found for ID: ${normalizedPatientId}`
            });
        }

        /*
        ----------------------------------------------------
        LATEST VITALS
        ----------------------------------------------------
        */

        const latestVitals =
            await Vitals.findOne({
                patientId: normalizedPatientId
            }).sort({
                createdAt: -1
            });

        /*
        ----------------------------------------------------
        LATEST LAB RESULT
        ----------------------------------------------------
        */

        const labResult =
            await LabResult.findOne({
                patientId: normalizedPatientId
            }).sort({
                createdAt: -1
            });

        /*
        ----------------------------------------------------
        LATEST CVD PREDICTION
        ----------------------------------------------------
        */

        const cvdPrediction =
            await CvdPrediction.findOne({
                patientId: normalizedPatientId
            }).sort({
                timestamp: -1,
                createdAt: -1
            });

        /*
        ----------------------------------------------------
        LATEST DIABETES PREDICTION
        ----------------------------------------------------
        */

        const diabetesPrediction =
            await DiabetesPrediction.findOne({
                patientId: normalizedPatientId
            }).sort({
                timestamp: -1,
                createdAt: -1
            });

        /*
        ----------------------------------------------------
        ACTIVE ALERTS
        ----------------------------------------------------
        */

        const activeAlerts =
            await Alert.find({
                patientId: normalizedPatientId,
                status: {
                    $in: [
                        "ACTIVE",
                        "ACKNOWLEDGED"
                    ]
                }
            })
            .sort({
                detectedAt: -1
            })
            .limit(20);

        /*
        ----------------------------------------------------
        BLOOD PRESSURE
        ----------------------------------------------------
        */

        let systolicBp = null;
        let diastolicBp = null;

        if (latestVitals) {

            if (
                latestVitals.bloodPressure &&
                typeof latestVitals.bloodPressure === "object"
            ) {

                systolicBp =
                    toNumber(
                        latestVitals.bloodPressure.systolic
                    );

                diastolicBp =
                    toNumber(
                        latestVitals.bloodPressure.diastolic
                    );
            }

            /*
            Fallback if BP is stored as a string
            */

            if (
                systolicBp === null &&
                diastolicBp === null &&
                typeof latestVitals.bloodPressure === "string"
            ) {

                const bp =
                    parseBloodPressure(
                        latestVitals.bloodPressure
                    );

                systolicBp = bp.systolic;
                diastolicBp = bp.diastolic;
            }
        }

        /*
        ----------------------------------------------------
        HBA1C
        ----------------------------------------------------
        */

        let hba1c = null;

        if (
            labResult &&
            Array.isArray(labResult.labResults)
        ) {

            const hba1cResult =
                labResult.labResults
                    .filter(
                        item =>
                            item.testName &&
                            item.testName
                                .toLowerCase()
                                .includes("hba1c")
                    )
                    .sort(
                        (a, b) =>
                            new Date(b.date) -
                            new Date(a.date)
                    )[0];

            if (hba1cResult) {

                hba1c =
                    toNumber(
                        hba1cResult.value
                    );
            }
        }

        /*
        FALLBACK PATIENT LAB DATA
        */

        if (
            hba1c === null &&
            patient.labResults &&
            patient.labResults.hba1c !== undefined
        ) {

            hba1c =
                toNumber(
                    String(
                        patient.labResults.hba1c
                    ).replace("%", "")
                );
        }

        /*
        ----------------------------------------------------
        CVD RISK
        ----------------------------------------------------
        */

        const cvdRisk =
            cvdPrediction
                ? toNumber(
                    cvdPrediction.riskScore
                )
                : null;

        /*
        ----------------------------------------------------
        DIABETES RISK
        ----------------------------------------------------
        */

        const diabetesRisk =
            diabetesPrediction
                ? diabetesPrediction.riskLevel || "Unknown"
                : "Unknown";

        /*
        ====================================================
        GOALS
        ====================================================
        */

        const goals = [];

        /*
        BP GOAL
        */

        if (
            systolicBp !== null &&
            diastolicBp !== null &&
            (
                systolicBp >= 130 ||
                diastolicBp >= 80
            )
        ) {

            goals.push({
                title:
                    "Improve blood pressure control",

                target:
                    "Target BP according to clinician-defined care goals",

                reason:
                    `Latest BP is ${systolicBp}/${diastolicBp} mmHg.`,

                interventions: [
                    "Regular blood pressure monitoring",
                    "Review blood pressure trends with clinician",
                    "Follow the prescribed care plan"
                ]
            });
        }

        /*
        HBA1C GOAL
        */

        if (
            hba1c !== null &&
            hba1c >= 7
        ) {

            goals.push({
                title:
                    "Improve glycemic control",

                target:
                    "HbA1c target according to clinician-defined goal",

                reason:
                    `Latest HbA1c is ${hba1c}%.`,

                interventions: [
                    "Regular glucose monitoring",
                    "Follow the prescribed diabetes care plan",
                    "Clinical review of glycemic control"
                ]
            });
        }

        /*
        CVD GOAL
        */

        if (
            cvdRisk !== null &&
            cvdRisk >= 20
        ) {

            goals.push({
                title:
                    "Reduce cardiovascular risk",

                target:
                    "Reduce modifiable cardiovascular risk factors",

                reason:
                    `Latest recorded CVD risk is ${cvdRisk}%.`,

                interventions: [
                    "Monitor cardiovascular risk factors",
                    "Review recent vital trends",
                    "Clinical cardiovascular risk review"
                ]
            });
        }

        /*
        DIABETES GOAL
        */

        if (
            diabetesRisk === "High" ||
            diabetesRisk === "Moderate"
        ) {

            goals.push({
                title:
                    "Monitor diabetes-related risk",

                target:
                    "Maintain diabetes-related parameters within clinician-defined targets",

                reason:
                    `Latest diabetes risk level is ${diabetesRisk}.`,

                interventions: [
                    "Monitor relevant glucose and laboratory parameters",
                    "Follow the prescribed diabetes care plan",
                    "Schedule clinical follow-up when required"
                ]
            });
        }

        /*
        ALERT GOAL
        */

        if (activeAlerts.length > 0) {

            goals.push({
                title:
                    "Follow up on recent monitoring alerts",

                target:
                    "Review unresolved clinical monitoring alerts",

                reason:
                    `${activeAlerts.length} unresolved monitoring alert(s) are associated with this patient.`,

                interventions: [
                    "Review recent monitoring alerts",
                    "Review relevant vital trends",
                    "Escalate for clinical review when appropriate"
                ]
            });
        }

        /*
        DEFAULT GOAL
        */

        if (goals.length === 0) {

            goals.push({
                title:
                    "Maintain current health status",

                target:
                    "Continue routine monitoring and follow-up",

                reason:
                    "No major careplan trigger was identified from the currently available patient data.",

                interventions: [
                    "Continue routine monitoring",
                    "Follow the existing care plan",
                    "Attend scheduled follow-up"
                ]
            });
        }

        /*
        ====================================================
        TASKS
        ====================================================
        */

        const tasks = [];

        /*
        MEDICATION
        */

        if (
            Array.isArray(patient.medications) &&
            patient.medications.length > 0
        ) {

            tasks.push({
                taskId: randomUUID(),

                title:
                    "Follow prescribed medication plan",

                category:
                    "Medication",

                frequency:
                    "Daily",

                instructions:
                    "Record whether the prescribed medication plan was followed.",

                active: true
            });
        }

        /*
        BP
        */

        if (
            systolicBp !== null ||
            diastolicBp !== null
        ) {

            tasks.push({
                taskId: randomUUID(),

                title:
                    "Blood pressure monitoring",

                category:
                    "Vital Monitoring",

                frequency:
                    "Daily",

                instructions:
                    "Record blood pressure readings according to the careplan.",

                active: true
            });
        }

        /*
        GLUCOSE
        */

        if (
            hba1c !== null ||
            diabetesPrediction
        ) {

            tasks.push({
                taskId: randomUUID(),

                title:
                    "Glucose monitoring",

                category:
                    "Glucose Monitoring",

                frequency:
                    "Daily",

                instructions:
                    "Record glucose monitoring activity according to the careplan.",

                active: true
            });
        }

        /*
        LIFESTYLE
        */

        tasks.push({
            taskId: randomUUID(),

            title:
                "Follow recommended lifestyle activities",

            category:
                "Lifestyle",

            frequency:
                "Daily",

            instructions:
                "Record completion of the lifestyle activities included in the careplan.",

            active: true
        });

        /*
        FOLLOW-UP
        */

        tasks.push({
            taskId: randomUUID(),

            title:
                "Clinical follow-up",

            category:
                "Follow-up",

            frequency:
                "As scheduled",

            instructions:
                "Record completion of the recommended clinical follow-up.",

            active: true
        });

        /*
        ====================================================
        PREDICTED OUTCOME
        ====================================================
        */

        let outcomeMetric =
            "Clinical Monitoring";

        let currentValue = null;

        let projectedValue = null;

        let outcomeNote =
            "Continue monitoring patient progress against the careplan.";

        if (cvdRisk !== null) {

            outcomeMetric =
                "CVD Risk";

            currentValue =
                cvdRisk;

            projectedValue =
                Number(
                    Math.max(
                        cvdRisk - 5,
                        0
                    ).toFixed(1)
                );

            outcomeNote =
                "Target improvement in modifiable cardiovascular risk factors; actual outcomes require clinical reassessment.";
        }

        /*
        ====================================================
        CREATE OR UPDATE CAREPLAN
        ====================================================
        */

        const careplan =
            await Careplan.findOneAndUpdate(

                {
                    patientId:
                        normalizedPatientId
                },

                {
                    $set: {

                        patientId:
                            normalizedPatientId,

                        patientName:
                            patient.name,

                        generatedAt:
                            new Date(),

                        sourceData: {

                            cvdRisk,

                            diabetesRisk,

                            systolicBp,

                            diastolicBp,

                            hba1c,

                            alertCount:
                                activeAlerts.length
                        },

                        goals,

                        tasks,

                        predictedOutcome: {

                            metric:
                                outcomeMetric,

                            currentValue,

                            projectedValue,

                            note:
                                outcomeNote
                        },

                        status:
                            "Draft",

                        guidelineStatus:
                            "Not Validated"
                    }
                },

                {
                    new: true,

                    upsert: true,

                    runValidators: true,

                    setDefaultsOnInsert: true
                }
            );

        /*
        ====================================================
        RESPONSE
        ====================================================
        */

        return res.status(200).json({

            success: true,

            message:
                "Careplan generated successfully.",

            data:
                careplan
        });

    } catch (error) {

        console.error(
            "Careplan generation error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to generate careplan.",

            error:
                error.message
        });
    }
});

/*
============================================================
UPDATE CAREPLAN STATUS
============================================================
*/

router.patch("/:careplanId/status", async (req, res) => {

    try {

        const {
            status
        } = req.body;

        const allowedStatuses = [
            "Draft",
            "Under Review",
            "Approved",
            "Active",
            "Completed"
        ];

        if (
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Invalid careplan status. Allowed values: ${allowedStatuses.join(", ")}`
            });
        }

        const careplan =
            await Careplan.findByIdAndUpdate(

                req.params.careplanId,

                {
                    $set: {
                        status
                    }
                },

                {
                    new: true,
                    runValidators: true
                }
            );

        if (!careplan) {

            return res.status(404).json({

                success: false,

                message:
                    "Careplan not found."
            });
        }

        return res.status(200).json({

            success: true,

            message:
                "Careplan status updated successfully.",

            data:
                careplan
        });

    } catch (error) {

        console.error(
            "Careplan status update error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to update careplan status.",

            error:
                error.message
        });
    }
});

module.exports = router;