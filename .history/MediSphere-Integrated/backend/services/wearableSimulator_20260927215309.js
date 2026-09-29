const { randomUUID } = require("crypto");
const { Kafka } = require("kafkajs");

const { kafka } = require("../config/kafka");
const { connectKafkaWithRetry } = require("./kafkaConnection");

const producer = kafka.producer();
let simulationInterval = null;
let messageInFlight = false;

const patients = [
  {
    patientId: "PAT-001",
    patientName: "Sarah M.",
    age: 62,
  },
  {
    patientId: "PAT-002",
    patientName: "John D.",
    age: 58,
  },
  {
    patientId: "PAT-003",
    patientName: "Priya K.",
    age: 45,
  },
  {
    patientId: "PAT-004",
    patientName: "Rahul K.",
    age: 51,
  },
  {
    patientId: "PAT-005",
    patientName: "Emily R.",
    age: 34,
  },
  {
    patientId: "PAT-006",
    patientName: "David P.",
    age: 67,
  },
];

function generateHeartRate(patient) {
  let heartRate =
    Math.floor(Math.random() * 81) + 60;

  /*
   * Occasionally generate an abnormal
   * heart-rate value so that the anomaly
   * detection module can be tested.
   */

  if (Math.random() < 0.15) {
    heartRate =
      Math.random() < 0.5
        ? Math.floor(Math.random() * 20) + 145
        : Math.floor(Math.random() * 10) + 45;
  }

  return {
    patientId: patient.patientId,
    patientName: patient.patientName,
    age: patient.age,

    deviceId:
      `WEARABLE-${patient.patientId}`,

    vitalType: "HEART_RATE",

    value: heartRate,

    unit: "bpm",

    timestamp: new Date().toISOString(),

    eventId: randomUUID(),
  };
}

async function startWearableSimulator() {
  try {
    await producer.connect();

    console.log(
      "Wearable Simulator connected to Kafka."
    );

    setInterval(async () => {
      try {
        const patient =
          patients[
            Math.floor(
              Math.random() *
              patients.length
            )
          ];

        const telemetry =
          generateHeartRate(patient);

        await producer.send({
        await connectKafkaWithRetry(producer, "Wearable simulator");

        if (simulationInterval) {
          return;
        }

        console.log("Wearable Simulator connected to Kafka.");
        );
        simulationInterval = setInterval(async () => {
          if (messageInFlight) {
            return;
          }
        console.error(
          messageInFlight = true;
          try {
            const patient = patients[Math.floor(Math.random() * patients.length)];
            const telemetry = generateHeartRate(patient);
        );
            await producer.send({
              topic: "wearable-telemetry",
              messages: [{
                key: telemetry.patientId,
                value: JSON.stringify(telemetry),
              }],
            });
    );
            console.log("Wearable telemetry sent:", telemetry);
          } catch (error) {
            console.error("Failed to send wearable telemetry:", error);
            try {
              await producer.disconnect();
            } catch {}
            await connectKafkaWithRetry(producer, "Wearable simulator");
          } finally {
            messageInFlight = false;
          }
        }, 3000);
      }
  startWearableSimulator,