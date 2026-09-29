const express = require("express");
const LabResult = require("../models/LabResult");

const router = express.Router();

// Get all lab results
router.get("/", async (req, res) => {
    try {
        const results = await LabResult.find({}).sort({ createdAt: -1 });
        res.json(results);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch lab results",
            error: err.message
        });
    }
});

// Create/Update lab results for a patient
router.post("/", async (req, res) => {
    try {
        const { patientId, labResults } = req.body;
        
        if (!patientId) {
            return res.status(400).json({ message: "Patient ID is required" });
        }

        const result = await LabResult.findOneAndUpdate(
            { patientId },
            { $set: { labResults } },
            { new: true, upsert: true }
        );

        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({
            message: "Failed to save lab results",
            error: err.message
        });
    }
});

module.exports = router;
