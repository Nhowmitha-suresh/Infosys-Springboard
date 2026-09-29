const express = require("express");
const axios = require("axios");
const Appointment = require("../models/Appointment");

const router = express.Router();

const FHIR_BASE_URL = "https://hapi.fhir.org/baseR4";

// ================= Existing Routes =================

// Get all local appointments
router.get("/", async (req, res) => {
    try {
        const appointments = await Appointment.find({});
        res.status(200).json(appointments);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch appointments",
            error: err.message
        });
    }
});

// Create local appointment
router.post("/", async (req, res) => {
    try {
        const appointmentData = req.body;
        
        if (!appointmentData.id) {
            appointmentData.id = "APT-" + Date.now();
        }

        const appointment = new Appointment(appointmentData);
        await appointment.save();

        res.status(201).json({
            message: "Appointment booked successfully",
            appointment
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to create appointment",
            error: err.message
        });
    }
});

// Update local appointment
router.put("/:id", async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        res.json({
            message: "Appointment updated",
            appointment
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to update appointment",
            error: err.message
        });
    }
});

// Delete local appointment
router.delete("/:id", async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndDelete({ id: req.params.id });

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        res.json({
            message: "Appointment deleted"
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete appointment",
            error: err.message
        });
    }
});

// ================= FHIR Route =================

// Fetch appointments from HAPI FHIR
router.get("/fhir", async (req, res) => {
    try {

        const response = await axios.get(
            `${FHIR_BASE_URL}/Appointment?_count=100`
        );

        const fhirAppointments = (response.data.entry || []).map(item => ({
            id: item.resource.id,
            status: item.resource.status || "Unknown",
            start: item.resource.start || "N/A",
            end: item.resource.end || "N/A",
            description: item.resource.description || "No Description"
        }));

        res.json(fhirAppointments);

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch appointments from FHIR"
        });

    }
});


// Get one local appointment
router.get("/:id", async (req, res) => {
    try {
        const appointment = await Appointment.findOne({ id: req.params.id });

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        res.json(appointment);
    } catch (err) {
        res.status(500).json({
            message: "Error fetching appointment",
            error: err.message
        });
    }
});

module.exports = router;