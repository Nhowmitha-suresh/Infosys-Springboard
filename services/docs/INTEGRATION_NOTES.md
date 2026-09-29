# Integration Notes (Milestone 1 + Milestone 2 merge)

Short technical log of what changed during the merge, for anyone
diffing against the original two ZIPs.

## Kept unchanged
- `backend/` — the entire Milestone 1 Spring Boot app (auth, patients,
  appointments, vitals, alerts, care plans, consent, twins, reports,
  the heuristic `predictions` feature). No files under `backend/` were
  modified.
- `frontend/src/pages/**` (all pre-existing pages), `context/`,
  `utils/`, `api/*Service.js`, `api/axiosClient.js` — untouched.

## Added
- `ml-service/` — Milestone 2's Flask backend (`app.py`, `db.py`,
  `model_registry.py`, `predict.py`, `shap_explain.py`,
  `train_model.py`, `models/patient_risk_v1.pkl`,
  `requirements.txt`), plus a new `Dockerfile` and `.env.example`.
- `database/*.sql` — Milestone 2's SQL, moved out of `ml-service/database/`
  to a shared top-level `database/` folder, with `predictions` renamed to
  `ml_predictions` throughout (see `database/README.md`).
- `frontend/src/api/mlClient.js` — new Axios instance for the ML service,
  parallel to (not replacing) `axiosClient.js`.
- `frontend/src/components/ml/*` — ported from Milestone 2's
  `components/models/*` and `components/*`, imports rewritten from
  `services/api` to `api/mlClient`.
- `frontend/src/pages/ml/{ModelsPage,AnalyticsPage,FederatedTrainingPage}.jsx`
  — new pages wrapping the above in `DashboardLayout`, added to
  `App.jsx` routes (`/ml/models`, `/ml/analytics`,
  `/ml/federated-training`, ADMIN/DOCTOR only) and `Sidebar.jsx`
  (ADMIN/DOCTOR nav sections).
- `frontend/src/styles/ml.css` — Milestone 2's `App.css`, renamed and
  scoped to the ML pages only (no class-name collisions with `index.css`).
- Root `docker-compose.yml`, `.env.example`, `README.md` — rewritten to
  cover the full 3-service stack. `frontend/Dockerfile` + `nginx.conf`
  are new.

## Discarded (not carried forward)
- Milestone 2's own React auth (`services/authService.js`,
  `services/api.js`, `pages/LoginPage.jsx`) — replaced by Milestone 1's
  real JWT auth, per the integration brief.
- Milestone 2's mock `Patients.jsx` and `Reports.jsx` — Milestone 1
  already has real, backend-integrated equivalents (`PatientsPage.jsx`,
  `ReportsPage.jsx`); keeping the mock versions alongside would have
  meant two different "Patients" screens with different (fake vs real)
  data, which the integration brief explicitly asked to avoid.

## Renamed
- `predictions` (Milestone 2's ML predictions table) → `ml_predictions`,
  everywhere: `database/ml_model_versioning.sql`,
  `database/shap_explainability.sql`, `ml-service/predict.py`,
  `ml-service/shap_explain.py`. Milestone 1's own `predictions` table
  (Java entity `Prediction.java`) is untouched and unrelated.

---

# Integration Notes (Milestone 3 merge)

Milestone 3 (`medisphere-milestone3-final-single-host.zip`) shipped as a
second, fully standalone project: its own Node/Express + Socket.IO
backend AND its own React frontend (`medisphere-dashboard`, no auth,
mock/demo data for everything except the two real Milestone 3
components). Same approach as the Milestone 1+2 merge above: the real,
working backend logic was integrated in; the duplicate mockup frontend
was not.

## The schema mismatch (why this wasn't a drop-in)
Milestone 3's SQL and backend code were written against a database shape
that never actually shipped under those names in this merged platform:
- It expected `patients(patient_id)` and `predictions(prediction_id,
  patient_id)` as FK targets.
- What the merged platform actually has: `patients(id)` / `predictions(id)`
  (Java, numeric surrogate keys, real CRUD) and `ml_patient_data(patient_id)`
  / `ml_predictions(prediction_id, patient_id)` (Milestone 2's VARCHAR-keyed
  ML feature set, demo IDs P001-P003).
- Applying the original script as-is would fail at
  `CREATE TABLE rule_executions` with "column prediction_id referenced in
  foreign key constraint does not exist".

Fix: both FKs were repointed at the tables that actually exist
(`ml_patient_data` / `ml_predictions`) — the same demo patient set the ML
Models pages already use. No other part of the schema changed. Verified
by applying the full `database/*.sql` sequence against a clean Postgres
16 instance and round-tripping `POST /api/monitoring/evaluate` end to end
(rules fire, `rule_executions` + `notifications` rows persist, status
transitions PENDING -> SENT).

## Added
- `monitoring-service/` — Milestone 3's Node/Express + Socket.IO backend
  (`server.js`, `src/app.js`, `src/db.js`, routes/controllers/services,
  `scripts/setupDb.js`, `scripts/seedRules.js`, `scripts/simulateVitals.js`),
  plus a new `Dockerfile`. Kept as its own microservice, same role in the
  stack as `ml-service/`.
- `database/z_monitoring_schema.sql` — the adapted schema (FKs fixed, see
  above), copied in so it applies automatically on first `docker compose up`
  alongside the other `database/*.sql` files (the `z` prefix guarantees it
  runs after `ml_model_versioning.sql` / `ml_patient_data.sql`, which it
  depends on). Also seeds the same 5 default clinical rules the frontend
  used to hardcode, so the catalog isn't empty on first boot.
- `frontend/src/api/{monitoringClient.js,monitoringSocket.js,monitoringService.js}`
  — new Axios instance + Socket.IO singleton + service wrapper, parallel to
  `mlClient.js`.
- `frontend/src/pages/ml/MonitoringPage.jsx` — new page (rule catalog,
  a vitals-evaluation panel, a live notifications feed over Socket.IO,
  and the rule-execution audit trail), added to `App.jsx`
  (`/ml/monitoring`, ADMIN/DOCTOR only) and `Sidebar.jsx`.
- `frontend/nginx.conf` + `frontend/Dockerfile` — `/monitoring/` (REST)
  and `/socket.io/` (WebSocket, with upgrade headers) proxy locations
  added, same pattern as the existing `/ml/` location.
- Root `docker-compose.yml`, `.env.example`, `frontend/.env.example` —
  `monitoring-service` added as a fourth application service.

## Discarded (not carried forward)
- Milestone 3's own standalone `frontend/` (`medisphere-dashboard`) — no
  auth, and duplicates Dashboard/Patients/Predictions/Alerts/Reports with
  mock data the platform already has real, backend-integrated versions
  of. Only its two genuinely new, real components (rule engine,
  notifications) were carried forward, as a new page inside the
  platform's one authenticated frontend, not a second app.
- `monitoring-service`'s built-in static-frontend-serving fallback in
  `app.js` (it served `../frontend/dist` for its own single-host demo
  mode) — removed; it's a pure API microservice now, consistent with
  `ml-service/`.

## Renamed / adjusted
- `monitoring-service/src/db/milestone3_database.sql` FKs: see "The schema
  mismatch" above.
- `monitoring-service/src/controllers/monitoring.controller.js`: the
  `resolvePredictionId` fallback query now reads `ml_predictions` instead
  of the nonexistent `predictions(prediction_id)`.
- `monitoring-service/scripts/simulateVitals.js` (dev-only demo helper):
  now loads patients from `ml_patient_data` instead of a `patients`
  table with a `patient_id` column that doesn't exist on the Java side.
- `monitoring-service/package.json` `start` script: no longer builds a
  frontend that isn't shipped here (`npm --prefix ../frontend run build`
  removed).
- `frontend/Dockerfile`: `VITE_API_BASE_URL` / `VITE_ML_API_URL` /
  `VITE_MONITORING_API_URL` now default to same-origin paths (`/api`,
  `/ml`, `/monitoring`) at build time, and `docker-compose.yml` passes
  them explicitly as build args. Previously `VITE_ML_API_URL` had no
  build-time default and fell back to `http://127.0.0.1:5000` even
  inside the Docker build, so the containerized frontend was calling
  ml-service's (and would have called monitoring-service's) port
  directly rather than going through nginx — technically working on a
  single machine, since both ports are also published to the host, but
  not truly single-origin. Fixed so the Docker build is single-origin by
  default: the browser only ever talks to port 3000.
