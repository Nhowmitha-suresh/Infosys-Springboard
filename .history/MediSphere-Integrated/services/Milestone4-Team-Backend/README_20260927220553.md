# MediSphere Backend — Patient 360 (Spring Boot + PostgreSQL)

Implements the Java/Spring Boot REST + WebSocket contract that the
MediSphere React frontend already expects (see the frontend's
`src/api/*Service.js` files). This phase covers **Patient 360**:

- Login (minimal, so `ProtectedRoute` on the frontend works) — `POST /api/auth/login`, `/register`, `/me`
- Patients — full CRUD
- Allergies, prescriptions, appointment history — read, per patient
- Consent management + immutable audit trail
- **Live vitals streamed through Kafka**: a simulated "bedside monitor"
  producer publishes readings to a `vitals.raw` topic; a consumer
  persists them and pushes them out over WebSocket. See "Kafka vitals
  streaming" below.

## Requirements
- Java 17+
- Maven 3.9+
- PostgreSQL 14+ running locally or in the cloud
- Docker (for local Kafka — see below), or your own Kafka broker

## Run locally

1. Create the database (PostgreSQL, unlike MySQL, needs this to exist
   up front — there's no `createDatabaseIfNotExist` option):
   ```sql
   CREATE DATABASE medisphere;
   ```
   Or with the CLI: `createdb medisphere`, or via Docker:
   ```bash
   docker run --name medisphere-postgres -e POSTGRES_PASSWORD=yourpassword \
     -e POSTGRES_DB=medisphere -p 5432:5432 -d postgres:16
   ```
2. Start PostgreSQL and Kafka from the integrated project root:
   ```bash
   docker compose -f docker-compose.database.yml up -d postgres
   docker compose up -d kafka
   ```
   Kafka listens on `localhost:9092` (KRaft mode, no ZooKeeper needed).
   The backend still starts fine without this — vitals just won't
   stream until Kafka is up.
3. Set your DB credentials as environment variables (or edit the
   defaults in `src/main/resources/application.yml`):
   ```bash
   export DB_URL="jdbc:postgresql://localhost:5432/medisphere"
   export DB_USERNAME=postgres
   export DB_PASSWORD=yourpassword
   export CORS_ALLOWED_ORIGINS=http://localhost:5173
   export KAFKA_BOOTSTRAP_SERVERS=localhost:9092   # default, only needed if you changed it
   ```
4. Run it:
   ```bash
   mvn spring-boot:run
   ```
   The app starts on `http://localhost:8080`. On first run, Hibernate
   creates the schema and `data.sql` seeds it with the same demo data
   the frontend's mock mode uses (patients 101–105, the 4 demo users,
   allergies, prescriptions, and consents for patient 101).

5. Point the frontend at it — in `frontend/.env`:
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_USE_MOCK_DATA=false
   ```
   Then `npm run dev`. Demo login: `admin@medisphere.com` / `admin123`
   (or doctor/patient/reception — same passwords as before).

## Kafka vitals streaming

```
VitalsStreamProducer          Kafka topic          VitalsStreamConsumer
(simulated monitor,     -->   "vitals.raw"    -->   (persists to DB,
 one per watched patient)                            pushes to WebSocket)
```

- **`VitalsStreamProducer`** starts a per-patient scheduled task the
  moment the *first* browser opens `WS /ws/vitals/{patientId}`, and
  stops it once the *last* viewer for that patient disconnects (tracked
  via a viewer refcount). It publishes a bounded random-walk reading
  every 2 seconds, keyed by `patientId` (so all of one patient's
  readings land on the same partition and stay ordered).
- **`VitalsStreamConsumer`** (`@KafkaListener` on `vitals.raw`) picks up
  every message, saves it via `VitalsService` (so `GET
  /api/patients/{id}/vitals` returns real history), and forwards it to
  every open WebSocket session watching that patient via
  `VitalsSessionRegistry`.
- **`VitalsWebSocketHandler`** itself no longer generates any data — it
  only registers/unregisters sessions and tells the producer who's
  watching. The WS message contract to the frontend
  (`{ patientId, heartRate, spo2, systolic, diastolic, temp, ts }`)
  hasn't changed.

**Swapping in real bedside monitors later:** replace
`VitalsStreamProducer` with whatever actually ingests monitor/wearable
data (an MQTT bridge, an HL7 interface engine, etc.) — as long as it
publishes the same `VitalsReading` JSON shape to the same `vitals.raw`
topic, `VitalsStreamConsumer`, the WebSocket layer, and the frontend
don't need to change at all.

## Endpoints implemented


```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me                       (Bearer token)

GET    /api/patients
GET    /api/patients/{id}
POST   /api/patients
PUT    /api/patients/{id}
DELETE /api/patients/{id}
GET    /api/patients/{id}/allergies       -> string[]
GET    /api/patients/{id}/prescriptions
GET    /api/patients/{id}/appointments
GET    /api/patients/{id}/vitals          -> history persisted from the live WS feed

GET    /api/patients/{id}/consents
PATCH  /api/patients/{id}/consents/{consentId}   { granted }
GET    /api/patients/{id}/consents/audit-log
POST   /api/consent/verify

GET    /api/appointments
GET    /api/appointments/{id}
POST   /api/appointments
PUT    /api/appointments/{id}
PATCH  /api/appointments/{id}/status
DELETE /api/appointments/{id}

GET    /api/dashboard/summary?role=

WS     /ws/vitals/{patientId}             -> { patientId, heartRate, spo2, systolic, diastolic, temp, ts }
```

Everything except `/api/auth/**`, `/api/consent/verify`, and `/ws/**`
requires `Authorization: Bearer <token>` — matching what
`axiosClient.js` already sends.

## Deploying so it's reachable globally

You need three pieces publicly hosted: the PostgreSQL database, this
backend, and the React frontend. A free/cheap combo that works well
for a student project:

1. **Database** — a managed PostgreSQL instance, e.g. [Railway](https://railway.app),
   [Render](https://render.com) (free Postgres tier), [Supabase](https://supabase.com),
   or [Neon](https://neon.tech). Copy the connection URL/user/password it gives you.
2. **Kafka** — for a real deployment, use a managed Kafka instead of
   `docker-compose.yml` (that file is for local dev only). Free tiers
   that work fine for this project size: [Upstash Kafka](https://upstash.com/kafka)
   or [Confluent Cloud](https://www.confluent.io/confluent-cloud/) (both
   have a free tier). They'll give you a bootstrap server URL + SASL
   credentials — set those as `KAFKA_BOOTSTRAP_SERVERS` and add the
   SASL properties to `application.yml` under `spring.kafka.properties`
   if the provider requires auth (Upstash/Confluent's docs show the
   exact properties to add). Skipping this step is fine too — the app
   still runs, vitals just won't stream.
3. **Backend** — deploy this folder to [Railway](https://railway.app) or
   [Render](https://render.com) (both auto-detect Spring Boot/Maven).
   Set these environment variables in their dashboard:
   - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (from step 1)
   - `KAFKA_BOOTSTRAP_SERVERS` (from step 2, if you set up managed Kafka)
   - `JWT_SECRET` — a long random string (don't reuse the default!)
   - `CORS_ALLOWED_ORIGINS` — your deployed frontend's URL, e.g. `https://medisphere.vercel.app`
   - `SQL_INIT_MODE=always` for the first deploy (seeds demo data), then you can set it to `never`
   Both platforms give you a public URL like `https://medisphere-backend-production.up.railway.app`.
4. **Frontend** — deploy the `frontend` folder to
   [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Set:
   - `VITE_API_BASE_URL=https://<your-backend-url>/api`
   - `VITE_USE_MOCK_DATA=false`

Once everything is up, your frontend's Vercel/Netlify URL is the
"host link" you can share — it talks to your live backend, PostgreSQL,
and Kafka over the internet, not localhost.

## Notes for your DB teammate
- Schema is currently generated by Hibernate (`ddl-auto: update`) from
  the `@Entity` classes in `src/main/java/.../entity/`. If they're
  designing the schema separately, point `DDL_AUTO=validate` at their
  schema instead, or share the entity classes with them to align on
  column names/types first.
- `data.sql` is idempotent (guarded with `NOT EXISTS`) so it's safe to
  leave `SQL_INIT_MODE=always` during development.
