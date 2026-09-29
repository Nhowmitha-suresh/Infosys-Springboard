# Newly surfaced modules — Authentication, Model Versioning, Clinical Rule Engine

These three modules already existed as backend services in the integrated project
(`services/`) but had no screen in the main UI. They are now available from the
left sidebar. Nothing else in the application was modified.

| Sidebar entry | Route | Backend service | Roles |
|---|---|---|---|
| Authentication | `#/authentication` | Spring Boot + JWT (`services/Milestone4-Team-Backend`, port 8080) | all |
| Model Versioning | `#/model-versioning` | Flask ML service (`services/ml-service`, use port **5001**) | admin, doctor, employee (write actions: admin, doctor) |
| Clinical Rule Engine | `#/clinical-rule-engine` | Node monitoring service (`services/monitoring-service`, port 4000) | admin, doctor, employee (rule toggle: admin, doctor) |

* **Authentication** — JWT sign-in and registration against the Spring backend, session
  status with token expiry, server-side verification (`/api/auth/me`) and sign-out.
  The portal's existing sign-in is untouched; the JWT is stored separately
  (`sessionStorage: medisphere_jwt`). Demo login from the Spring README: `admin@medisphere.com` / `admin123`.
* **Model Versioning** — model registry table, version details/metrics, register a
  version, activate (auto-archives the previous one) and archive.
* **Clinical Rule Engine** — rule catalog (activate/deactivate), vitals simulator that
  evaluates every active rule, rule-execution audit trail, and the mobile-style
  notification feed (auto-refreshes every 5 s, acknowledge supported).

## Files added
```
src/services/serviceClients.ts      shared fetch helper + base URLs
src/services/authApi.ts             Spring JWT client
src/services/mlService.ts           ML model-registry client
src/services/ruleEngineService.ts   rule engine / notifications client
src/pages/Authentication.tsx
src/pages/ModelVersioning.tsx
src/pages/ClinicalRuleEngine.tsx
start-new-modules.bat               optional: starts the three services (Windows)
```
## Files touched (wiring only)
`src/App.tsx` (3 lazy imports + 3 routes) · `src/components/Sidebar.tsx` (3 nav items + role access) ·
`src/components/Layout.tsx` (3 route permissions) · `vite.config.js` (dev/preview proxy).

## Running it
1. Databases: `docker compose -f docker-compose.database.yml up -d postgres`
2. Main app as before (`npm install && npm run dev`, Node backend on 5000).
3. Services — or just run `start-new-modules.bat`:
   * Spring: `cd services/Milestone4-Team-Backend && mvn spring-boot:run` (port 8080)
   * Monitoring: `cd services/monitoring-service && npm install && npm start` (port 4000)
   * ML: `cd services/ml-service && pip install -r requirements.txt && flask --app app run --port 5001`
     (the Node backend already uses 5000, so the Flask service must not use its default port)
   * Database settings: the ML service reads `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`;
     the monitoring service reads `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` (or `DATABASE_URL`).
     For the compose database use `localhost` / `5432` / `medisphere` / `postgres` / `medisphere`
     (`start-new-modules.bat` sets all of these).
4. Open `http://localhost:5173`, sign in, and use the new sidebar entries.

The dev server proxies `/svc/spring`, `/svc/ml` and `/svc/monitoring` to those ports, so no CORS setup
is needed. Override targets with `SPRING_API_TARGET`, `ML_API_TARGET`, `MONITORING_API_TARGET`, or point
the UI at other hosts with `VITE_SPRING_API_URL`, `VITE_ML_API_URL`, `VITE_MONITORING_API_URL`.
If a service is not running, its page shows a clear "cannot reach the … service" banner instead of failing.

Note: the Clinical Rule Engine simulator needs the patient (P001–P003) to have an ML prediction first
(the monitoring service links every evaluation to `ml_predictions`).

## Team-C / Team-D pages (HIPAA Audit Logs, False Alert Rate, ...)
These embedded pages need the Team-C/D Spring Boot backend on port 8080 (see INTEGRATED_FRONTEND_UPDATE_V3.md).
`vite.config.js` now forwards their relative calls (`/api/c`, `/api/d`, `/api/fhir`, `/api/federated`,
`/api/consent`, `/api/anomaly`, `/api/audit`) to `http://localhost:8080` (override: `TEAM_CD_API_TARGET`)
instead of letting the dev server answer with `index.html`. Restart `npm run dev` after updating.
