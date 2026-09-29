# Medisphere — Monitoring Service (Milestone 3)

Real backend for the two Milestone 3 components:

1. **Clinical Rule Engine** — evaluates vitals against a database-backed
   rule catalog (`clinical_rules`), logs every evaluation
   (`rule_executions`), and produces alerts.
2. **Mobile Notifications** — persists a `notifications` row per fired
   alert and pushes it in real time over Socket.IO (a stand-in for
   FCM/APNs push).

**This service is now integrated into the merged Medisphere Healthcare
Platform** as an internal microservice (same role as `../ml-service/`),
reached through the platform's one authenticated React frontend
(`../frontend/src/pages/ml/MonitoringPage.jsx`, at `/ml/monitoring`,
ADMIN/DOCTOR only) rather than through a standalone UI. See
`../docs/INTEGRATION_NOTES.md` for the full integration log, including why
its schema's foreign keys were repointed from the originally-assumed
`patients(patient_id)` / `predictions(prediction_id)` to the tables that
actually exist in this platform.

## Prerequisites

- Node.js 18+ (uses the built-in `fetch` in the simulator script)
- A PostgreSQL database that **already has** the Milestone 2 schema:
  `ml_patient_data(patient_id)`, `ml_predictions(prediction_id,
  patient_id)` — the Milestone 3 tables have foreign keys into those two
  (see `../database/ml_patient_data.sql` and
  `../database/ml_model_versioning.sql`, both of which run before this
  service's schema in the Docker Compose init sequence).

## Setup

Already running via `docker compose up -d --build` from the platform
root? Nothing to do here — the schema applies itself automatically. The
steps below are for running this service on its own (no Docker):

```bash
cd monitoring-service
npm install
cp .env.example .env
# edit .env with your real Postgres connection details (same "medisphere"
# database the rest of the platform uses)

npm run db:setup    # applies src/db/milestone3_database.sql (idempotent)
npm run db:seed     # inserts the 5 default clinical rules (idempotent;
                     # already done by db:setup too -- only needed if you
                     # applied an older copy of the schema without it)
npm start            # or `npm run dev` for auto-restart on changes
```

The server listens on `PORT` (default `4000`) and exposes both the REST
API and the Socket.IO realtime channel on that same port.

Optional: `npm run simulate` runs a small dev-only script that reads the
demo patients (`P001`–`P003`) from `ml_patient_data` and POSTs simulated
vitals to `/api/monitoring/evaluate` every few seconds, so you can see
rules fire and notifications arrive without a real wearable/Kafka feed. It
is not part of Milestone 3's scope — it exists purely so you can demo/test
the two required components end to end.

## REST API

### Clinical rules (`clinical_rules`)

| Method | Path              | Description                          |
|--------|-------------------|---------------------------------------|
| GET    | `/api/rules`      | List all rules (`?activeOnly=true` to filter) |
| GET    | `/api/rules/:id`  | Get one rule                          |
| POST   | `/api/rules`      | Create a rule `{ ruleName, description, condition, action, isActive? }` |
| PATCH  | `/api/rules/:id`  | Update a rule (any subset of the same fields; e.g. `{ isActive: false }` to disable) |
| DELETE | `/api/rules/:id`  | Delete a rule                         |

### Monitoring / rule evaluation (`rule_executions`)

| Method | Path                        | Description |
|--------|-----------------------------|-------------|
| POST   | `/api/monitoring/evaluate`  | Runs every active rule against one vitals reading. See body shape below. |
| GET    | `/api/monitoring/executions?patientId=&ruleId=&limit=` | Reads the `clinical_rule_results` view (full audit trail — fired **and** not-fired). |

`POST /api/monitoring/evaluate` body:

```json
{
  "patient": { "id": "p-1", "name": "Sarah M." },
  "vitals": {
    "hr": 145, "spo2": 97, "systolic": 122, "diastolic": 78,
    "temp": 36.9, "context": "At rest", "baselineHr": 68
  },
  "history": [ { "hr": 70, "...": "..." } ],
  "predictionId": 123
}
```

- `predictionId` is optional — if omitted, the service looks up that
  patient's most recent row in `predictions` (Milestone 2) and uses it,
  since `rule_executions`/`notifications` both require a `prediction_id`.
- Response: `{ fired: [...alerts], notifications: [...persisted rows] }`.
  The `fired` alert shape intentionally matches what the frontend's
  simulated `clinicalRuleEngine.evaluateRules()` already returns
  (`ruleId`, `ruleName`, `category`, `severity`, `message`, `analysis`,
  `confidence`, `autoActions`, `vitals`, `timestamp`) so it's a drop-in
  replacement later.

### Notifications (`notifications`)

| Method | Path                                         | Description |
|--------|----------------------------------------------|-------------|
| GET    | `/api/notifications?patientId=&status=&limit=&offset=` | Reads the `patient_notifications` view |
| GET    | `/api/notifications/unread-count/:patientId` | Count of notifications not yet `READ` |
| PATCH  | `/api/notifications/:id` `{ "status": "READ" }` | Update status (`PENDING`/`SENT`/`DELIVERED`/`READ`/`FAILED`); stamps `sent_at`/`read_at` automatically |

## Realtime (Socket.IO)

Connect to the same origin/port as the REST API.

**Client → server**
- `subscribe:patient` (patientId) — join that patient's notification room
- `unsubscribe:patient` (patientId)
- `notification:ack` (notificationId) — marks the notification `DELIVERED`

**Server → client**
- `notification:new` — emitted to `patient:<id>` and the global
  `notifications` room whenever a rule fires. Payload:
  ```json
  {
    "id": 42,
    "patientId": "p-1",
    "ruleId": 1,
    "predictionId": 123,
    "notificationType": "critical",
    "title": "Critical alert",
    "message": "Sarah M. · HR spike 145 bpm at rest (baseline 68 bpm)",
    "status": "SENT",
    "createdAt": "2026-08-21T10:00:00.000Z",
    "alert": { "ruleName": "...", "category": "...", "severity": "...", "analysis": "...", "confidence": 0.9, "autoActions": ["..."], "vitals": { "...": "..." } }
  }
  ```

## Project structure

```
backend/
  server.js                       HTTP + Socket.IO entry point
  src/
    app.js                        Express app (middleware, routes, error handler)
    db.js                         pg Pool + query() helper
    db/milestone3_database.sql    schema (same script you provided)
    routes/                       rules / notifications / monitoring routers
    controllers/                  request handlers
    services/
      ruleEngine.service.js       the 5 clinical rules, evaluated server-side
      notification.service.js    persists + pushes notifications
    sockets/index.js              Socket.IO room/event wiring
  scripts/
    setupDb.js                   applies the schema
    seedRules.js                 seeds the default rule catalog
    simulateVitals.js            dev-only vitals stream for testing (optional)
```

## Frontend integration

**In this merged platform**, the wiring described in the original
Milestone 3 doc (below) did not happen — that referred to Milestone 3's
own standalone `medisphere-dashboard` frontend, which was not carried
forward (see `../docs/INTEGRATION_NOTES.md` for why). Instead, this
service is wired into the platform's one real frontend:

- `../frontend/src/api/monitoringClient.js` — Axios instance for this
  service's REST API (parallel to `mlClient.js` for `ml-service/`).
- `../frontend/src/api/monitoringSocket.js` — Socket.IO singleton;
  components subscribe/unsubscribe, they don't own the connection.
- `../frontend/src/api/monitoringService.js` — thin wrapper functions
  (`listRules`, `evaluateVitals`, `listExecutions`, `listNotifications`,
  `markNotificationStatus`) used by the page below.
- `../frontend/src/pages/ml/MonitoringPage.jsx` — the actual UI: rule
  catalog, a form to submit a simulated vitals reading for a demo patient
  (`P001`–`P003`), a live notifications feed, and the rule-execution audit
  trail. Routed at `/ml/monitoring`, ADMIN/DOCTOR only (`App.jsx`,
  `Sidebar.jsx`).

Since `rule_executions`/`notifications` both require a real
`prediction_id` (FK into `ml_predictions`, not this platform's own
`predictions` table — see Prerequisites above), a demo patient needs at
least one row in `ml_predictions` before you can evaluate against them:
run a Prediction for that patient from **ML Models → Prediction** first
(Milestone 2), or pass `predictionId` explicitly in the request body.

---

*The rest of this section is preserved from the original standalone
Milestone 3 doc, describing wiring into Milestone 3's own
`medisphere-dashboard` frontend — not applicable in this merged platform,
kept here for reference only:*

The `medisphere-dashboard` frontend now talks to this backend instead of
simulating the rule engine/notifications in the browser:

- `src/services/clinicalRuleEngine.js` (frontend) is a thin client:
  `fetchRules()` calls `GET /api/rules`, `evaluateRules()` calls
  `POST /api/monitoring/evaluate`. Function names and the returned alert
  shape are unchanged, so no other frontend component needed to change
  except `MonitoringContext.jsx` (now awaits the call) and
  `RuleEnginePanel.jsx` (now reads the rule catalog from context instead
  of a hardcoded local array).
- `src/services/notificationService.js` (frontend) connects to this
  backend over Socket.IO and listens for `notification:new`, translating
  it into the same notification shape the UI already used. The
  `subscribeToNotifications(callback)` API is unchanged.
- `src/services/mockVitalsStream.js` is still the vitals source (a
  four-patient random walk standing in for the real wearable/Kafka feed)
  — it now feeds this backend instead of the old in-browser rule engine.
