require("dotenv").config();
const mongoose = require("mongoose");


const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Employee = require("../models/Employee");
const FhirResource = require("../models/FhirResource");
const Vitals = require("../models/Vitals");
const LabResult = require("../models/LabResult");
const KafkaEvent = require("../models/KafkaEvent");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medisphere";

// Helper arrays for generation
const firstNames = ['Anushree', 'Ashok', 'Raghavendra', 'Shreya', 'Nikhil', 'Pooja', 'Keerthana', 'Pranav', 'Aditi', 'Preethi', 'Venkatesh', 'Sumithra', 'Srinivas', 'Deepika', 'Vivek', 'Gowri', 'Santhosh', 'Archana', 'Chethan', 'Varun', 'Rashmi', 'Shruti', 'Anand', 'Mahesh', 'Rajeshwari', 'Suresh', 'Vinay', 'Soumya', 'Sunita', 'Kavya'];
const lastNames = ['Naik', 'Shetty', 'Hegde', 'Rao', 'Bhat', 'Kamath', 'Shenoy', 'Pai', 'Gowda', 'Kulkarni', 'Patil', 'Deshpande', 'Poojary', 'Acharya', 'Maindan'];
const doctorFirstNames = ['Ananthakrishna', 'Sudhakar', 'Veena', 'Gururaj', 'Sandhya', 'Manjunath', 'Usha', 'Prakash', 'Suma', 'Nitin', 'Ramesh', 'Aravind', 'Saritha', 'Ganesh', 'Latha'];
const receptionistFirstNames = ['Kavya', 'Shruthi', 'Pallavi', 'Meghana', 'Nisha', 'Asha', 'Pooja', 'Sanjana', 'Divya', 'Manasa', 'Tejaswini'];
const staffFirstNames = ['Manoj', 'Harsha', 'Swathi', 'Preethi', 'Vivek', 'Anil', 'Ramesh', 'Shilpa', 'Keerthana', 'Ganesh', 'Chinmay', 'Rakshit'];
const depts = ['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Orthopedics', 'Emergency Medicine', 'Radiology', 'Dermatology', 'Gastroenterology', 'Endocrinology'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const karnatakaHospitals = [
  'Kasturba Medical College Hospital, Manipal',
  'KMC Hospital, Attavar, Mangaluru',
  'Father Muller Medical College Hospital, Mangaluru',
  'A.J. Hospital & Research Centre, Mangaluru',
  'Yenepoya Medical College Hospital, Mangaluru',
  'K.S. Hegde Charitable Hospital, Mangaluru',
  'TMA Pai Hospital, Udupi',
  'Victoria Hospital, Bengaluru',
  'Manipal Hospital, HAL Airport Road, Bengaluru',
  'Narayana Health City, Bengaluru',
  'Fortis Hospital, Bannerghatta Road, Bengaluru',
  "St. John's Medical College Hospital, Bengaluru",
  'Jayadeva Institute of Cardiovascular Sciences, Bengaluru',
  'NIMHANS, Bengaluru',
  'SDM College of Medical Sciences, Dharwad',
  'Karnataka Institute of Medical Sciences (KIMS), Hubballi',
  'JSS Hospital, Mysuru',
  'Mysore Medical College (KR Hospital), Mysuru',
  'Shivamogga Institute of Medical Sciences (SIMS), Shivamogga',
  'Vijayanagar Institute of Medical Sciences (VIMS), Ballari'
];
const conditionsList = ['Essential Hypertension', 'Type 2 Diabetes Mellitus', 'Dengue Fever', 'Chikungunya', 'Malaria (P. vivax)', 'Bronchial Asthma', 'Ischemic Heart Disease', 'Chronic Kidney Disease', 'Osteoarthritis', 'Acid Peptic Disease'];
const medicationsList = ['Paracetamol 650mg (Dolo 650)', 'Metformin 500mg (Glycomet)', 'Telmisartan 40mg (Telma 40)', 'Pantoprazole 40mg (Pan 40)', 'Amlodipine 5mg', 'Atorvastatin 10mg', 'Montelukast 10mg (Levocet-M)', 'Azithromycin 500mg'];
const allergiesList = ['Penicillin', 'Sulfa Drugs', 'NSAIDs', 'Dust Mite Allergy', 'Seafood Allergy', 'None'];
const insuranceList = ['Star Health Insurance #SH-882193', 'Ayushman Bharat - Arogya Karnataka (AB-ARK) #ARK-90214', 'ICICI Lombard Health #IL-44021', 'HDFC ERGO Health #HE-30192', 'Care Health Insurance #CHI-55102'];
const resourceTypes = ['Patient', 'Observation', 'Condition', 'MedicationRequest', 'DiagnosticReport'];
const sources = ['Epic EHR', 'Cerner Millennium', 'LabCorp API', 'Hospital EHR'];
const topics = ['patient-vitals', 'telemetry-stream', 'bedside-monitor'];

async function seed() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    console.log("Clearing all collections...");
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await User.deleteMany({});
    await Employee.deleteMany({});
    await FhirResource.deleteMany({});
    await Vitals.deleteMany({});
    await LabResult.deleteMany({});
    await KafkaEvent.deleteMany({});
    console.log("All collections cleared!");

    // 1. Seed Doctors (50)
    const doctors = [];
    for (let i = 1; i <= 50; i++) {
      const fn = doctorFirstNames[i % doctorFirstNames.length];
      const ln = lastNames[(i * 3) % lastNames.length];
      doctors.push({
        id: `DOC-${1000 + i}`,
        name: `Dr. ${fn} ${ln}`,
        email: `dr.${fn.toLowerCase()}.${ln.toLowerCase()}@medisphere.health`,
        department: depts[i % depts.length],
        specialization: `${depts[i % depts.length]} Specialist`,
        experience: `${5 + (i % 25)} Years`,
        phone: `+91 98450 ${(10000 + i).toString()}`,
        rating: (4.2 + (i % 8) * 0.1).toFixed(1),
        availability: 'Mon - Fri (08:00 - 17:00)',
        status: i % 7 === 0 ? 'On Leave' : 'Available',
        patientsCount: 40 + (i * 3)
      });
    }
    await Doctor.insertMany(doctors);
    console.log(`Successfully seeded ${doctors.length} Doctors!`);

    // 2. Seed Patients (300)
    const patients = [];
    for (let i = 1; i <= 300; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[(i * 2) % lastNames.length];
      const age = 18 + (i % 65);
      patients.push({
        id: `PAT-${2000 + i}`,
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gmail.com`,
        age: age,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        bloodGroup: bloodGroups[i % bloodGroups.length],
        hospital: karnatakaHospitals[i % karnatakaHospitals.length],
        assignedDoctor: doctors[i % doctors.length].name,
        doctorEmail: doctors[i % doctors.length].email,
        phone: `+91 98440 ${(20000 + i).toString()}`,
        conditions: [conditionsList[i % conditionsList.length], conditionsList[(i + 3) % conditionsList.length]],
        medications: medicationsList.slice(0, 1 + (i % 3)),
        allergies: allergiesList[i % allergiesList.length],
        insurance: insuranceList[i % insuranceList.length],
        emergencyContact: `Ashok ${ln} (Spouse) - +91 98450 99887`,
        vitals: {
          hr: 65 + (i % 30),
          bp: `${110 + (i % 30)}/${70 + (i % 20)}`,
          spo2: 95 + (i % 5),
          temp: (98.2 + (i % 3) * 0.4).toFixed(1),
          resp: 14 + (i % 6)
        },
        twinCompleteness: 85 + (i % 16),
        onboardedDate: new Date(Date.now() - (i * 86400000)).toISOString().split('T')[0]
      });
    }
    // Specific patient P1001 / PAT-2001
    patients[0] = {
      id: 'PAT-2001',
      name: 'Anushree Naik',
      email: 'anushree.naik@gmail.com',
      age: 58,
      gender: 'Female',
      bloodGroup: 'O+',
      hospital: 'Kasturba Medical College Hospital, Manipal',
      assignedDoctor: 'Dr. Ananthakrishna Bhat',
      doctorEmail: 'dr.ananthakrishna.bhat@medisphere.health',
      phone: '+91 98450 12834',
      conditions: ['Essential Hypertension', 'Type 2 Diabetes Mellitus'],
      medications: ['Metformin 500mg (Glycomet)', 'Telmisartan 40mg (Telma 40)'],
      allergies: 'Sulfa Drugs',
      insurance: 'Ayushman Bharat - Arogya Karnataka (AB-ARK) #ARK-90214',
      emergencyContact: 'Ashok Naik (Spouse) - +91 98450 99988',
      vitals: { hr: 72, bp: '130/85', spo2: 98, temp: 98.6, resp: 16 },
      twinCompleteness: 100,
      onboardedDate: '2026-01-15'
    };
    await Patient.insertMany(patients);
    console.log(`Successfully seeded ${patients.length} Patients!`);

    // 3. Seed Appointments (1000)
    const appointments = [];
    for (let i = 1; i <= 1000; i++) {
      const p = patients[i % patients.length];
      const d = doctors[i % doctors.length];
      const daysOffset = (i % 30) - 15;
      const apptDate = new Date(Date.now() + daysOffset * 86400000).toISOString().split('T')[0];
      appointments.push({
        id: `APT-${5000 + i}`,
        patientId: p.id,
        patientName: p.name,
        doctorId: d.id,
        doctorName: d.name,
        department: d.department,
        date: apptDate,
        time: `${8 + (i % 9)}:00 AM`,
        symptoms: 'Routine consultation & follow up checkup.',
        status: daysOffset < 0 ? (i % 10 === 0 ? 'Cancelled' : 'Completed') : (i % 3 === 0 ? 'Pending' : 'Confirmed'),
        notes: 'Patient progress stable. Recommended diet regimen.'
      });
    }
    await Appointment.insertMany(appointments);
    console.log(`Successfully seeded ${appointments.length} Appointments!`);

    // 4. Seed Users (5 Login Credentials)
    const users = [
      { id: 'ADMIN001', name: 'System Administrator', email: 'admin@medisphere.health', username: 'ADMIN001', password: 'admin123', role: 'admin', status: 'Active', department: 'Administration', phone: '+91 98450 11223', token: 'token-admin' },
      { id: 'DOC1001', name: 'Dr. Ananthakrishna Bhat', email: 'doctor@medisphere.health', username: 'DOC1001', password: 'doctor123', role: 'doctor', status: 'Active', department: 'Cardiology', phone: '+91 98450 12345', token: 'token-doctor' },
      { id: 'PAT1001', name: 'Anushree Naik', email: 'patient@medisphere.health', username: 'PAT1001', password: 'patient123', role: 'patient', status: 'Active', department: 'Outpatient', phone: '+91 98440 20001', token: 'token-patient' },
      { id: 'REC1001', name: 'Pooja Rao', email: 'reception@medisphere.health', username: 'REC1001', password: 'reception123', role: 'receptionist', status: 'Active', department: 'Reception Desk', phone: '+91 98450 33445', token: 'token-reception' },
      { id: 'EMP1001', name: 'Keerthana Bhat', email: 'employee@medisphere.health', username: 'EMP1001', password: 'employee123', role: 'employee', status: 'Active', department: 'Medical Staff (Nurse)', phone: '+91 98450 55667', token: 'token-employee' }
    ];
    await User.insertMany(users);
    console.log(`Successfully seeded ${users.length} Users!`);

    // 5. Seed Employees (25)
    const employees = [];
    for (let i = 1; i <= 25; i++) {
      const efn = staffFirstNames[i % staffFirstNames.length];
      const eln = lastNames[(i * 3) % lastNames.length];
      employees.push({
        id: `EMP-${4000 + i}`,
        name: `${efn} ${eln}`,
        email: `emp.${efn.toLowerCase()}.${eln.toLowerCase()}@medisphere.health`,
        role: i % 2 === 0 ? 'Lab Technician' : 'Nurse Specialist',
        department: depts[i % depts.length],
        shift: 'Day Shift'
      });
    }
    await Employee.insertMany(employees);
    console.log(`Successfully seeded ${employees.length} Employees!`);

    // 6. Seed FHIR Resources (50)
    const fhirResources = [];
    for (let i = 1; i <= 50; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[i % lastNames.length];
      const resType = resourceTypes[i % resourceTypes.length];
      const source = sources[i % sources.length];
      
      fhirResources.push({
        resourceType: resType,
        resourceId: `FHIR-RES-${10000 + i}`,
        patientId: `PAT-${2000 + i}`,
        patientName: `${fn} ${ln}`,
        source: source,
        validationStatus: i % 15 === 0 ? "Invalid" : "Valid",
        receivedAt: new Date(Date.now() - (i * 3600000)).toISOString(),
        resource: {
          resourceType: resType,
          id: `FHIR-RES-${10000 + i}`,
          status: "final",
          subject: { reference: `Patient/PAT-${2000 + i}`, display: `${fn} ${ln}` },
          effectiveDateTime: new Date(Date.now() - (i * 3600000)).toISOString()
        }
      });
    }
    fhirResources.push({
      resourceType: "Patient",
      resourceId: "FHIR-P1001",
      patientId: "P1001",
      patientName: "Anushree Naik",
      source: "Hospital EHR",
      validationStatus: "Valid",
      receivedAt: new Date().toISOString(),
      resource: {
        resourceType: "Patient",
        id: "P1001",
        active: true,
        name: [{ use: "official", family: "Naik", given: ["Anushree"] }]
      }
    });
    await FhirResource.insertMany(fhirResources);
    console.log(`Successfully seeded ${fhirResources.length} FHIR Resources!`);

    // 7. Seed Vitals
    const vitalsList = [];
    for (let i = 1; i <= 10; i++) {
      vitalsList.push({
        patientId: `PAT-${2000 + i}`,
        heartRate: 70 + (i % 25),
        bloodPressure: {
          systolic: 120 + (i % 20),
          diastolic: 80 + (i % 15)
        },
        spo2: 95 + (i % 5),
        temperature: (36.5 + (i % 10) * 0.1).toFixed(1),
        timestamp: new Date(Date.now() - (i * 600000)).toISOString()
      });
    }
    vitalsList.push({
      patientId: "P1001",
      heartRate: 72,
      bloodPressure: {
        systolic: 130,
        diastolic: 85
      },
      spo2: 98,
      temperature: 36.7,
      timestamp: new Date().toISOString()
    });
    await Vitals.insertMany(vitalsList);
    console.log(`Successfully seeded ${vitalsList.length} Vitals records!`);

    // 8. Seed Lab Results
    const labResultsList = [];
    for (let i = 1; i <= 10; i++) {
      labResultsList.push({
        patientId: `PAT-${2000 + i}`,
        labResults: [
          {
            testName: "HbA1c",
            value: (5.5 + (i % 5) * 0.4).toFixed(1),
            unit: "%",
            date: new Date(Date.now() - (i * 86400000)).toISOString()
          }
        ]
      });
    }
    labResultsList.push({
      patientId: "P1001",
      labResults: [
        {
          testName: "HbA1c",
          value: 7.2,
          unit: "%",
          date: new Date().toISOString()
        }
      ]
    });
    await LabResult.insertMany(labResultsList);
    console.log(`Successfully seeded ${labResultsList.length} Lab Results!`);

    // 9. Seed Kafka Events
    const kafkaEvents = [];
    for (let i = 1; i <= 50; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[i % lastNames.length];
      const topic = topics[i % topics.length];
      
      kafkaEvents.push({
        eventId: `KFK-EVT-${20000 + i}`,
        patientId: `PAT-${2000 + i}`,
        patientName: `${fn} ${ln}`,
        eventType: "VITAL",
        topic: topic,
        status: i % 25 === 0 ? "FAILED" : "PROCESSED",
        receivedAt: new Date(Date.now() - (i * 120000)).toISOString(),
        hr: 65 + (i % 30),
        bp: `${115 + (i % 20)}/${75 + (i % 15)}`,
        spo2: 96 + (i % 4),
        temp: (98.0 + (i % 10) * 0.1).toFixed(1),
        resp: 14 + (i % 6),
        latencyMs: 1 + (i % 4)
      });
    }
    kafkaEvents.push({
      eventId: "E1001",
      patientId: "P1001",
      patientName: "Anushree Naik",
      eventType: "VITAL",
      topic: "patient-vitals",
      status: "PROCESSED",
      receivedAt: new Date().toISOString(),
      hr: 72,
      bp: "130/85",
      spo2: 98,
      temp: "98.6",
      resp: 16,
      latencyMs: 2
    });
    await KafkaEvent.insertMany(kafkaEvents);
    console.log(`Successfully seeded ${kafkaEvents.length} Kafka Events!`);

    console.log("Database seeding completed successfully!");
  } catch (err) {
    console.error("Database seeding failed:", err);
  } finally {
    mongoose.connection.close();
  }
}

seed();
