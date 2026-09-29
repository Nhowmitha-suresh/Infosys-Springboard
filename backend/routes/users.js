const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: err.message
        });
    }
});

// Create/Upsert user
router.post("/", async (req, res) => {
    try {
        const userData = req.body;
        
        if (!userData.id) {
            userData.id = "USR-" + Date.now();
        }

        const user = await User.findOneAndUpdate(
            { id: userData.id },
            { $set: userData },
            { new: true, upsert: true }
        );

        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({
            message: "Failed to save user",
            error: err.message
        });
    }
});

// Update user
router.put("/:id", async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({
            message: "Failed to update user",
            error: err.message
        });
    }
});

// Delete user
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ id: req.params.id });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete user",
            error: err.message
        });
    }
});

module.exports = router;
