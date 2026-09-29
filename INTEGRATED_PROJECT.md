# MediSphere — Integrated Team Project

This archive combines the supplied `MediSphere-Final.zip` and `MediSphere-Healthcare-Platform-Mileston4-main.zip` into one project workspace.

## Integration rule

The supplied projects use **different persistence stacks**:

- Main application: Node.js/Express + MongoDB (`backend/`)
- Team Milestone-4 application: Spring Boot + PostgreSQL (`services/Milestone4-Team-Backend/`)
- Team ML service: Flask + PostgreSQL (`services/ml-service/`)
- Team monitoring service: Node.js + PostgreSQL (`services/monitoring-service/`)

They are therefore kept as separate services inside one integrated workspace instead of overwriting one database schema with the other. This prevents accidental collection/table renaming, data loss, or model/schema collisions.

## Main application

The original `MediSphere-Final` application remains the primary React + Express application and retains its M1–M4 modules, including CVD risk, diabetes risk, federated training, continuous monitoring, alerts, AI careplan generation, clinical guidelines, and adherence tracking.

Run:

```text
Terminal 1
npm install
npm run dev

Terminal 2
cd backend
npm install
npm start
```

Main frontend: `http://localhost:5173`
Main backend: `http://localhost:5000`

## Team Milestone-4 stack

The second supplied project is preserved under `services/` without replacing its PostgreSQL database configuration or its Spring Boot data model.

Spring Boot backend:

```text
cd services/Milestone4-Team-Backend
mvn spring-boot:run
```

Default backend port: `8080`.

Team frontend:

```text
cd services/Milestone4-Team-Frontend
npm install
npm run dev
```

Default frontend port: `5173` (use another port if the main frontend is already running).

The PostgreSQL connection remains controlled by the team's original environment variables:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DDL_AUTO`
- `SQL_INIT_MODE`

No database migration, table rename, collection rename, or data copy was performed during this merge.

## Important

Do not run both React frontends on the same port at the same time. The main application is the primary demo application; the preserved team stack is available under `services/` for its own Milestone-4 functionality and database-backed screens.
