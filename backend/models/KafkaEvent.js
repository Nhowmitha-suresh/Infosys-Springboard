const mongoose = require("mongoose");

const kafkaEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  receivedAt: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("KafkaEvent", kafkaEventSchema);
