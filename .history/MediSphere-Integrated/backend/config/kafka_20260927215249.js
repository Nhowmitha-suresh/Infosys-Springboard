const { Kafka } = require("kafkajs");

const brokers = (process.env.KAFKA_BROKERS || process.env.KAFKA_BROKER || "localhost:9092")
  .split(",")
  .map((broker) => broker.trim())
  .filter(Boolean);

const kafka = new Kafka({
  clientId: "medisphere-healthcare",
  brokers,
  retry: {
    initialRetryTime: 300,
    retries: 8,
    maxRetryTime: 30000
  }
});

const producer = kafka.producer();

const consumer = kafka.consumer({
  groupId: "medisphere-anomaly-detection",
});

module.exports = {
  kafka,
  producer,
  consumer,
};