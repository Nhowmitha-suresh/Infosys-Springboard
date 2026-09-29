const mongoose = require("mongoose");

function requireMongo(req, res, next) {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: "MongoDB is not connected"
        });
    }

    next();
}

module.exports = requireMongo;