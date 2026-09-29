# Integrated Frontend Update V2

The final MediSphere workspace now exposes **both teams' complete frontend experiences** from the main application's sidebar.

## Team A frontend
The original Team-A React/TypeScript application remains the primary application and keeps its existing routes and UI modules.

## Team B frontend
The complete compiled Team-B React frontend is preserved under:

`public/team-b/`

The Team-B source remains under:

`services/Milestone4-Team-Frontend/`

The Team-B UI includes:

- Admin / Doctor / Patient / Receptionist dashboards
- Patient management
- Patient 360
- Appointments
- Consent Management
- Consent Verification
- Digital Health Twins
- Predictions
- Alerts
- Careplans
- Reports
- ML Models
- ML Analytics
- Federated Training
- Continuous Monitoring
- Precision Care
- Outcome Measurement
- Clinical Guideline Compliance
- Provider Collaboration

## How to open it
Run the main Team-A frontend normally and log in. From the left sidebar choose:

**Team-B Complete UI**

The complete Team-B compiled frontend opens inside the same MediSphere page using an embedded frame. This avoids replacing Team-A routes and avoids modifying Team-B's existing backend/database implementation.

## Important runtime note
The embedded Team-B screens are the compiled frontend from Team-B's supplied Spring Boot/static build. Its API-backed functions still require the Team-B Spring Boot backend, PostgreSQL database and any associated ML/monitoring services when a live backend operation is used. The UI itself is preserved in the final archive.
