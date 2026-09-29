const express = require("express");
const Employee = require("../models/Employee");

const router = express.Router();

// Get all employees
router.get("/", async (req, res) => {
    try {
        const employees = await Employee.find({}).sort({ createdAt: -1 });
        res.json(employees);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch employees",
            error: err.message
        });
    }
});

// Create/Upsert employee
router.post("/", async (req, res) => {
    try {
        const employeeData = req.body;
        
        if (!employeeData.id) {
            employeeData.id = "EMP-" + Date.now();
        }

        const employee = await Employee.findOneAndUpdate(
            { id: employeeData.id },
            { $set: employeeData },
            { new: true, upsert: true }
        );

        res.status(201).json(employee);
    } catch (err) {
        res.status(500).json({
            message: "Failed to save employee",
            error: err.message
        });
    }
});

// Update employee
router.put("/:id", async (req, res) => {
    try {
        const employee = await Employee.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json(employee);
    } catch (err) {
        res.status(500).json({
            message: "Failed to update employee",
            error: err.message
        });
    }
});

// Delete employee
router.delete("/:id", async (req, res) => {
    try {
        const employee = await Employee.findOneAndDelete({ id: req.params.id });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({ success: true, message: "Employee deleted successfully" });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete employee",
            error: err.message
        });
    }
});

module.exports = router;
