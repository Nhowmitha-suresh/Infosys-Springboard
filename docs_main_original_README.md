# MediSphere – Integrated Final Project

This package combines the current working implementations from Milestones 1–4 into one project structure.

## Included modules

- Milestone 1: authentication/RBAC, patients, doctors, appointments, FHIR resources, digital twin, medical records, vitals, labs and audit/Kafka event views.
- Milestone 2: CVD risk prediction, diabetes complication risk prediction and federated-learning prototype.
- Milestone 3: continuous monitoring, wearable simulator, Kafka anomaly detection and real-time alerts.
- Milestone 4: AI careplan generation, clinical guideline validation and adherence tracking.

## Project structure

```text
MediSphere-Final/
├── src/                 # React + TypeScript frontend
├── backend/             # Express + MongoDB backend
├── public/
├── Documentation/
├── package.json
├── vite.config.js
└── .env.example
```

## Requirements

- Node.js 18+ recommended
- MongoDB (local or MongoDB Atlas)
- Kafka is optional for basic API/UI operation; Milestone 3 streaming features use the configured broker.

## Setup

### 1. Frontend

```bash
npm install
npm run dev
```

Vite will print the local frontend URL.

### 2. Backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and set a valid MongoDB connection string. For Kafka features, set `KAFKA_BROKER` as well.

Then:

```bash
npm start
```

The backend defaults to port `5000`.

### 3. Run both

Use two terminals: one at the project root for Vite and one in `backend/` for Express.

## Important security note

The original milestone archives contained a live MongoDB credential in `backend/.env`. It has intentionally **not** been carried into this final ZIP. Configure your own `backend/.env` from the supplied example.

## Integration approach

Milestone 4 was used as the primary integration base because its current source already contains the Milestone 3 monitoring/alert stack and Milestone 4 careplan/guideline/adherence modules. The functional Milestone 2 CVD, diabetes and federated-training pages/API implementations were preserved where applicable.

Historical `.history` folders and duplicate package files were excluded from the final project to avoid stale source copies and unnecessary ZIP size.


## Presentation quick check

1. Start MongoDB and optionally Kafka.
2. Start the backend with `cd backend && npm start`.
3. Start the frontend with `npm run dev`.
4. Open the CVD Risk and Diabetes Risk pages and run a prediction. The prediction calculation is returned even if MongoDB is temporarily unavailable; when MongoDB is available the record is also persisted.
5. Open Alerts. The alert engine polls the backend and now supports heart-rate, SpO₂, temperature and systolic-BP anomaly events. If MongoDB is temporarily unavailable, alert events use an in-memory fallback for the active demo session.
6. Check `http://localhost:5000/api/health` to confirm the backend is online.
