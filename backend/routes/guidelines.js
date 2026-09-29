const express = require("express");

const Careplan = require("../models/Careplan");

const router = express.Router();


// =========================================================
// CLINICAL GUIDELINE ENGINE
// =========================================================
//
// POST /api/guidelines/validate
//
// Body:
//
// {
//   "careplanId": "CAREPLAN_ID"
// }
//
// The engine validates the generated careplan against
// basic clinical safety and completeness rules.
//
// =========================================================

router.post("/validate", async (req, res) => {

    try {

        const { careplanId } = req.body;


        // -------------------------------------------------
        // Validate request
        // -------------------------------------------------

        if (!careplanId) {

            return res.status(400).json({

                success: false,

                message:
                    "careplanId is required."

            });

        }


        // -------------------------------------------------
        // Find careplan
        // -------------------------------------------------

        const careplan =
            await Careplan.findById(
                careplanId
            );


        if (!careplan) {

            return res.status(404).json({

                success: false,

                message:
                    "Careplan not found."

            });

        }


        // -------------------------------------------------
        // Guideline checks
        // -------------------------------------------------

        const checks = [];

        let reviewRequired = false;


        // =================================================
        // CHECK 1 - Goals
        // =================================================

        const hasGoals =
            Array.isArray(careplan.goals) &&
            careplan.goals.length > 0;


        checks.push({

            rule:
                "Careplan must contain at least one clinical goal.",

            status:
                hasGoals
                    ? "PASS"
                    : "REVIEW",

            message:
                hasGoals
                    ? "Clinical goals are present."
                    : "No clinical goals were found."

        });


        if (!hasGoals) {
            reviewRequired = true;
        }


        // =================================================
        // CHECK 2 - Interventions
        // =================================================

        const hasInterventions =
            hasGoals &&
            careplan.goals.some(
                goal =>
                    Array.isArray(
                        goal.interventions
                    ) &&
                    goal.interventions.length > 0
            );


        checks.push({

            rule:
                "Each careplan should contain actionable interventions.",

            status:
                hasInterventions
                    ? "PASS"
                    : "REVIEW",

            message:
                hasInterventions
                    ? "Actionable interventions are present."
                    : "No actionable interventions were found."

        });


        if (!hasInterventions) {
            reviewRequired = true;
        }


        // =================================================
        // CHECK 3 - Monitoring Tasks
        // =================================================

        const hasTasks =
            Array.isArray(careplan.tasks) &&
            careplan.tasks.length > 0;


        checks.push({

            rule:
                "Careplan must contain monitoring or follow-up tasks.",

            status:
                hasTasks
                    ? "PASS"
                    : "REVIEW",

            message:
                hasTasks
                    ? `${careplan.tasks.length} monitoring/follow-up task(s) found.`
                    : "No monitoring or follow-up tasks were found."

        });


        if (!hasTasks) {
            reviewRequired = true;
        }


        // =================================================
        // CHECK 4 - Task Categories
        // =================================================

        const validCategories = [
            "Medication",
            "Vital Monitoring",
            "Glucose Monitoring",
            "Lifestyle",
            "Follow-up"
        ];


        const invalidTasks =
            hasTasks
                ? careplan.tasks.filter(
                    task =>
                        !validCategories.includes(
                            task.category
                        )
                )
                : [];


        const categoriesValid =
            invalidTasks.length === 0;


        checks.push({

            rule:
                "Careplan tasks must use recognized intervention categories.",

            status:
                categoriesValid
                    ? "PASS"
                    : "REVIEW",

            message:
                categoriesValid
                    ? "All task categories are valid."
                    : `${invalidTasks.length} task(s) have an invalid category.`

        });


        if (!categoriesValid) {
            reviewRequired = true;
        }


        // =================================================
        // CHECK 5 - Patient Identification
        // =================================================

        const patientIdentified =
            Boolean(
                careplan.patientId &&
                careplan.patientName
            );


        checks.push({

            rule:
                "Careplan must be associated with an identified patient.",

            status:
                patientIdentified
                    ? "PASS"
                    : "REVIEW",

            message:
                patientIdentified
                    ? `Careplan is associated with ${careplan.patientName}.`
                    : "Patient identification is incomplete."

        });


        if (!patientIdentified) {
            reviewRequired = true;
        }


        // =================================================
        // CHECK 6 - High Risk Clinical Context
        // =================================================
        //
        // High-risk data should trigger clinical review
        // rather than automatic approval.
        //
        // =================================================

        const sourceData =
            careplan.sourceData || {};


        const highCvdRisk =
            typeof sourceData.cvdRisk === "number" &&
            sourceData.cvdRisk >= 20;


        const highBloodPressure =
            typeof sourceData.systolicBp === "number" &&
            sourceData.systolicBp >= 180;


        const highDiastolicPressure =
            typeof sourceData.diastolicBp === "number" &&
            sourceData.diastolicBp >= 120;


        const highHba1c =
            typeof sourceData.hba1c === "number" &&
            sourceData.hba1c >= 9;


        const highRiskContext =
            highCvdRisk ||
            highBloodPressure ||
            highDiastolicPressure ||
            highHba1c;


        checks.push({

            rule:
                "High-risk clinical values require clinician review.",

            status:
                highRiskContext
                    ? "REVIEW"
                    : "PASS",

            message:
                highRiskContext
                    ? "High-risk clinical context detected. Clinical review is required."
                    : "No high-risk threshold requiring automatic review was detected."

        });


        if (highRiskContext) {
            reviewRequired = true;
        }


        // =================================================
        // FINAL GUIDELINE STATUS
        // =================================================

        const guidelineStatus =
            reviewRequired
                ? "Review Required"
                : "Compliant";


        const careplanStatus =
            reviewRequired
                ? "Under Review"
                : "Approved";


        // -------------------------------------------------
        // Update careplan
        // -------------------------------------------------

        careplan.guidelineStatus =
            guidelineStatus;

        careplan.status =
            careplanStatus;


        await careplan.save();


        // -------------------------------------------------
        // Response
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            message:
                reviewRequired
                    ? "Careplan requires clinical review."
                    : "Careplan passed the guideline checks.",

            data: {

                careplanId:
                    careplan._id,

                patientId:
                    careplan.patientId,

                patientName:
                    careplan.patientName,

                guidelineStatus,

                careplanStatus,

                checks

            }

        });

    } catch (error) {

        console.error(
            "Clinical guideline validation error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to validate careplan against clinical guidelines.",

            error:
                error.message

        });

    }

});


module.exports = router;