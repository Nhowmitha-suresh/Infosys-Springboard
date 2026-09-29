```javascript
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env")
});

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const requireMongo = require("./middleware/requireMongo");

// =========================================================
// MILESTONE 3 - WEARABLE DEVICE INTEGRATION
// =========================================================

const {
  startWearableSimulator
} = require("./services/wearableSimulator");

// =========================================================
// MILESTONE 3 - KAFKA STREAMS ANOMALY DETECTION
// =========================================================

const {
  startKafkaAnomalyDetector
} = require("./services/kafkaAnomalyDetector");

// =========================================================
// EXISTING ROUTES
// =========================================================

const appointmentRoutes = require("./routes/appointments");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctors");
const fhirResourceRoutes = require("./routes/fhirResources");
const vitalsRoutes = require("./routes/vitals");
const labResultRoutes = require("./routes/labResults");
const kafkaEventRoutes = require("./routes/kafkaEvents");
const userRoutes = require("./routes/users");
const employeeRoutes = require("./routes/employees");
const cvdRoutes = require("./routes/cvd");
const diabetesRoutes = require("./routes/diabetes");

// =========================================================
// MILESTONE 3 - REAL-TIME ALERT ENGINE
// =========================================================

const alertRoutes = require("./routes/alerts.cjs");

// =========================================================
// MILESTONE 4 - CAREPLAN & INTERVENTION
// =========================================================

// Module 1 - AI Careplan Generator
const careplanRoutes = require("./routes/careplans");

// Module 2 - Clinical Guideline Engine
const guidelineRoutes = require("./routes/guidelines");

// Module 3 - Adherence Tracking
const adherenceRoutes = require("./routes/adherence");

const app = express();

// =========================================================
// DATABASE
// =========================================================

connectDB();

// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());

app.use(express.json());

app.use("/api/appointments", requireMongo);
app.use("/api/doctors", requireMongo);
app.use("/api/fhir-resources", requireMongo);
app.use("/api/lab-results", requireMongo);
app.use("/api/kafka-events", requireMongo);
app.use("/api/users", requireMongo);
app.use("/api/employees", requireMongo);
app.use("/api/careplans", requireMongo);
app.use("/api/guidelines", requireMongo);
app.use("/api/adherence", requireMongo);

// =========================================================
// EXISTING API ROUTES
// =========================================================

app.use(
  "/api/appointments",
  appointmentRoutes
);

app.use(
  "/api/doctors",
  doctorRoutes
);

app.use(
  "/api/patients",
  patientRoutes
);

app.use(
  "/api/fhir-resources",
  fhirResourceRoutes
);

app.use(
  "/api/vitals",
  vitalsRoutes
);

app.use(
  "/api/lab-results",
  labResultRoutes
);

app.use(
  "/api/kafka-events",
  kafkaEventRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/employees",
  employeeRoutes
);

app.use(
  "/api/cvd",
  cvdRoutes
);

app.use(
  "/api/diabetes",
  diabetesRoutes
);

// =========================================================
// MILESTONE 3 - REAL-TIME ALERT ENGINE
// =========================================================

app.use(
  "/api/alerts",
  alertRoutes
);

// =========================================================
// MILESTONE 4 - CAREPLAN & INTERVENTION
// =========================================================

// AI Careplan Generator
app.use(
  "/api/careplans",
  careplanRoutes
);

// Clinical Guideline Engine
app.use(
  "/api/guidelines",
  guidelineRoutes
);

// Adherence Tracking
app.use(
  "/api/adherence",
  adherenceRoutes
);

// =========================================================
// ROOT ROUTE
// =========================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MediSphere Hospital Management API Running"
  });
});

app.get("/api/health", async (req, res) => {
  res.json({
    success: true,
    backend: "online",
    mongodb: require("mongoose").connection.readyState === 1
  });
});

// =========================================================
// START SERVER
// =========================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

  // =======================================================
  // MILESTONE 3 SERVICES
  // =======================================================

  if (process.env.KAFKA_ENABLED === "true") {

    // Start wearable device simulator
    startWearableSimulator();

    // Start Kafka Streams anomaly detector
    startKafkaAnomalyDetector();

    console.log(
      "Milestone 3 monitoring services started."
    );

  } else {

    console.log(
      "Kafka services disabled."
    );

  }

  // =======================================================
  // MILESTONE 4 SERVICES
  // =======================================================

  console.log(
    "Milestone 4 Careplan & Intervention APIs enabled."
  );

  console.log(
    "  - AI Careplan Generator: /api/careplans"
  );

  console.log(
    "  - Clinical Guideline Engine: /api/guidelines"
  );

  console.log(
    "  - Adherence Tracking: /api/adherence"
  );

});
```
