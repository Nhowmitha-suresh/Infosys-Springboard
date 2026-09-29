const express = require("express");
const axios = require("axios");
const Doctor = require("../models/Doctor");

const router = express.Router();

const FHIR_BASE_URL = "https://hapi.fhir.org/baseR4";

// ================= Existing Routes =================

// Get local doctors
router.get("/", async (req, res) => {
    try {
        const doctors = await Doctor.find({});
        res.json(doctors);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch doctors",
            error: err.message
        });
    }
});

// Add local doctor
router.post("/", async (req, res) => {
    try {
        const doctorData = req.body;
        
        if (!doctorData.id) {
            doctorData.id = "DOC-" + Date.now();
        }

        const doctor = new Doctor(doctorData);
        await doctor.save();

        res.json({
            success: true,
            doctor
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to add doctor",
            error: err.message
        });
    }
});

// Update local doctor
router.put("/:id", async (req, res) => {
    try {
        const doctor = await Doctor.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        res.json(doctor);
    } catch (err) {
        res.status(500).json({
            message: "Failed to update doctor",
            error: err.message
        });
    }
});

// Delete local doctor
router.delete("/:id", async (req, res) => {
    try {
        const doctor = await Doctor.findOneAndDelete({ id: req.params.id });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        res.json({
            success: true
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete doctor",
            error: err.message
        });
    }
});

// ================= FHIR Route =================

// Fetch doctors from HAPI FHIR
router.get("/fhir", async (req, res) => {
    try {

        const response = await axios.get(
            `${FHIR_BASE_URL}/Practitioner?_count=100`
        );

const doctors = (response.data.entry || []).map(item => ({

    id: item.resource.id,

    name:
        item.resource.name?.[0]?.text ||
        `${item.resource.name?.[0]?.given?.join(" ") || ""} ${item.resource.name?.[0]?.family || ""}`.trim() ||
        "Unknown",

    specialization: "General Physician",

    department: "General Medicine",

    experience: "N/A",

    qualification: "MBBS",

    availability: "Available"

}));

        res.json(doctors);

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch doctors from FHIR"
        });

    }
});
// ================= FHIR Doctors =================


module.exports = router;