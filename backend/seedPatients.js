require("dotenv").config();

const connectDB = require("./config/db");
const Patient = require("./models/Patient");

const patients = [
  {
    id: "P-101",
    name: "Arun Kumar",
    age: 54,
    gender: "Male",
    bloodGroup: "O+",
    conditions: ["Hypertension"],
    medications: ["Amlodipine"],
    allergies: [],
    hospital: "MediSphere General Hospital",
    assignedDoctor: "Dr. Ananya Iyer",
  },

  {
    id: "P-102",
    name: "Priya Sharma",
    age: 42,
    gender: "Female",
    bloodGroup: "A+",
    conditions: ["Pre-Diabetes"],
    medications: ["Metformin"],
    allergies: [],
    hospital: "MediSphere General Hospital",
    assignedDoctor: "Dr. Rahul Mehta",
  },

  {
    id: "P-103",
    name: "Ravi Wilson",
    age: 63,
    gender: "Male",
    bloodGroup: "B+",
    conditions: ["Diabetes", "Hypertension"],
    medications: ["Metformin", "Telmisartan"],
    allergies: [],
    hospital: "MediSphere General Hospital",
    assignedDoctor: "Dr. Ananya Iyer",
  },

  {
    id: "P-104",
    name: "Meena Davis",
    age: 49,
    gender: "Female",
    bloodGroup: "O+",
    conditions: ["Hypertension"],
    medications: ["Amlodipine"],
    allergies: [],
    hospital: "MediSphere General Hospital",
    assignedDoctor: "Dr. Priya Nair",
  },

  {
    id: "P-105",
    name: "Karthik Raj",
    age: 58,
    gender: "Male",
    bloodGroup: "A+",
    conditions: ["Hypertension", "Pre-Diabetes"],
    medications: ["Telmisartan"],
    allergies: [],
    hospital: "MediSphere General Hospital",
    assignedDoctor: "Dr. Rahul Mehta",
  },

  {
    id: "P-106",
    name: "Anitha Krishnan",
    age: 37,
    gender: "Female",
    bloodGroup: "B+",
    conditions: ["Preventive Monitoring"],
    medications: [],
    allergies: [],
    hospital: "MediSphere General Hospital",
    assignedDoctor: "Dr. Priya Nair",
  },

  {
    id: "P-107",
    name: "Suresh Babu",
    age: 67,
    gender: "Male",
    bloodGroup: "O-",
    conditions: ["Diabetes", "Hypertension"],
    medications: ["Metformin", "Amlodipine"],
    allergies: [],
    hospital: "MediSphere General Hospital",
    assignedDoctor: "Dr. Ananya Iyer",
  },

  {
    id: "P1006",
    name: "Lakshmi Devi",
    age: 46,
    gender: "Female",
    bloodGroup: "B-",
    conditions: ["Hypertension"],
    medications: ["Telmisartan"],
    allergies: [],
    hospital: "MediSphere General Hospital",
    assignedDoctor: "Dr. Ananya Iyer",
  },

  {
    id: "P-109",
    name: "Vignesh Kumar",
    age: 51,
    gender: "Male",
    bloodGroup: "AB+",
    conditions: ["Preventive Monitoring"],
    medications: [],
    allergies: [],
    hospital: "MediSphere General Hospital",
    assignedDoctor: "Dr. Rahul Mehta",
  },

  {
    id: "P-110",
    name: "Divya Srinivasan",
    age: 59,
    gender: "Female",
    bloodGroup: "O+",
    conditions: ["Diabetes", "Hypertension"],
    medications: ["Metformin", "Telmisartan"],
    allergies: [],
    hospital: "MediSphere General Hospital",
    assignedDoctor: "Dr. Priya Nair",
  },
];


async function seedPatients() {
  try {
    await connectDB();

    console.log("Connected to MongoDB.");

    for (const patient of patients) {
      await Patient.findOneAndUpdate(
        { id: patient.id },
        {
          $set: patient,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(
        `Patient ready: ${patient.id} - ${patient.name}`
      );
    }

    console.log("");
    console.log("======================================");
    console.log("10 PATIENTS SEEDED SUCCESSFULLY");
    console.log("======================================");
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error(
      "Patient seeding failed:",
      error
    );

    process.exit(1);
  }
}

seedPatients();