const express = require("express");
const FhirResource = require("../models/FhirResource");

const router = express.Router();

// Get all FHIR resources
router.get("/", async (req, res) => {
    try {
        const resources = await FhirResource.find({}).sort({ createdAt: -1 });
        res.json(resources);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch FHIR resources",
            error: err.message
        });
    }
});

// Create/Upsert FHIR resource
router.post("/", async (req, res) => {
    try {
        const resourceData = req.body;
        
        if (!resourceData.resourceId) {
            resourceData.resourceId = "FHIR-RES-" + Date.now();
        }

        const resource = await FhirResource.findOneAndUpdate(
            { resourceId: resourceData.resourceId },
            { $set: resourceData },
            { new: true, upsert: true }
        );

        res.status(201).json(resource);
    } catch (err) {
        res.status(500).json({
            message: "Failed to save FHIR resource",
            error: err.message
        });
    }
});

// Delete FHIR resource
router.delete("/:id", async (req, res) => {
    try {
        const resource = await FhirResource.findOneAndDelete({ resourceId: req.params.id });

        if (!resource) {
            return res.status(404).json({
                message: "FHIR resource not found"
            });
        }

        res.json({
            success: true,
            message: "FHIR resource deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete FHIR resource",
            error: err.message
        });
    }
});

module.exports = router;
