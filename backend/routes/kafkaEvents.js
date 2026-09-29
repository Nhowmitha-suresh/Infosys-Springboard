const express = require("express");
const KafkaEvent = require("../models/KafkaEvent");

const router = express.Router();

// Get all Kafka events
router.get("/", async (req, res) => {
    try {
        const events = await KafkaEvent.find({}).sort({ createdAt: -1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch Kafka events",
            error: err.message
        });
    }
});

// Create/Upsert Kafka event
router.post("/", async (req, res) => {
    try {
        const eventData = req.body;
        
        if (!eventData.eventId) {
            eventData.eventId = "E" + Date.now();
        }

        const event = await KafkaEvent.findOneAndUpdate(
            { eventId: eventData.eventId },
            { $set: eventData },
            { new: true, upsert: true }
        );

        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({
            message: "Failed to save Kafka event",
            error: err.message
        });
    }
});

// Update Kafka event status
router.put("/:id", async (req, res) => {
    try {
        const event = await KafkaEvent.findOneAndUpdate(
            { eventId: req.params.id },
            { $set: req.body },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ message: "Kafka event not found" });
        }

        res.json(event);
    } catch (err) {
        res.status(500).json({
            message: "Failed to update Kafka event",
            error: err.message
        });
    }
});

// Delete Kafka event
router.delete("/:id", async (req, res) => {
    try {
        const event = await KafkaEvent.findOneAndDelete({ eventId: req.params.id });

        if (!event) {
            return res.status(404).json({ message: "Kafka event not found" });
        }

        res.json({ success: true, message: "Kafka event deleted successfully" });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete Kafka event",
            error: err.message
        });
    }
});

module.exports = router;
