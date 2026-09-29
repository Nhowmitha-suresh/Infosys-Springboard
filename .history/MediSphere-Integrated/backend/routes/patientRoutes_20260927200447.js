const express = require("express");
const axios = require("axios");
const Patient = require("../models/Patient");
const requireMongo = require("../middleware/requireMongo");

const router = express.Router();

const FHIR_BASE_URL = "https://hapi.fhir.org/baseR4";

// Get all local patients from MongoDB
router.get("/", requireMongo, async (req, res) => {
    try {
        const patients = await Patient.find({});
        res.json(patients);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch patients",
            error: err.message
        });
    }
});

// Fetch patients from HAPI FHIR (External FHIR connection simulation)
router.get("/fhir", async (req, res) => {
    try {
        const response = await axios.get(
            `${FHIR_BASE_URL}/Patient?_count=100`
        );

        const patients = (response.data.entry || []).map(item => {
            const birthDate = item.resource.birthDate || null;
            let age = "N/A";

            if (birthDate) {
                age = new Date().getFullYear() - new Date(birthDate).getFullYear();
            }

            return {
                id: item.resource.id,
                name: item.resource.name?.[0]?.text || "Unknown",
                age,
                gender: item.resource.gender || "Unknown",
                bloodGroup: "N/A",
                assignedDoctor: "N/A",
                twinCompleteness: 100
            };
        });

        res.json(patients);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch patients from FHIR server"
        });
    }
});

// Create/Upsert patient in MongoDB
router.post("/", requireMongo, async (req, res) => {
    try {
        const patientData = req.body;
        
        if (!patientData.id) {
            patientData.id = "PAT-" + Date.now();
        }

        const patient = await Patient.findOneAndUpdate(
            { id: patientData.id },
            { $set: patientData },
            { new: true, upsert: true }
        );

        res.status(201).json(patient);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            message: "Failed to create/update patient",
            error: err.message
        });
    }
});

// Update patient in MongoDB
router.put("/:id", requireMongo, async (req, res) => {
    try {
        const patient = await Patient.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        res.json(patient);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            message: "Failed to update patient",
            error: err.message
        });
    }
});

// Delete patient from MongoDB
router.delete("/:id", requireMongo, async (req, res) => {
    try {
        const patient = await Patient.findOneAndDelete({ id: req.params.id });

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        res.json({
            success: true,
            message: "Patient deleted successfully"
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            message: "Failed to delete patient",
            error: err.message
        });
    }
});

module.exports = router;