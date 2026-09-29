# MediSphere Final Database Integration

This folder contains the supplied PostgreSQL 17 database dump used by the integrated MediSphere project.

## Database
- Engine: PostgreSQL
- Database name: `medisphere`
- Default port: `5432`
- Dump file: `medisphere_final_all_teams.sql`

## Restore manually

```bash
createdb -U postgres medisphere
psql -U postgres -d medisphere -f database/medisphere_final_all_teams.sql
```

If the database already exists and you want a clean restore, recreate the database first.

## Docker PostgreSQL

From the project root:

```bash
docker compose -f docker-compose.database.yml up -d
```

The SQL dump is mounted into PostgreSQL's initialization directory, so a fresh PostgreSQL volume is initialized automatically.

Default local credentials:
- Host: `localhost`
- Port: `5432`
- Database: `medisphere`
- User: `postgres`
- Password: `medisphere`

## Existing application backends

The integrated project intentionally retains its existing backend services:
- `backend/` — Node.js + Express + MongoDB + KafkaJS
- `services/Milestone4-Team-Backend/` — Spring Boot + JPA + PostgreSQL + Kafka + WebSocket
- `services/monitoring-service/` — Node.js + Express + PostgreSQL + Socket.IO
- `services/ml-service/` — Python + Flask + PostgreSQL + model/SHAP services

The supplied SQL dump is preserved exactly as provided; it is not silently rewritten or destructively merged into another schema.

### Important schema note

The supplied dump is a cross-team integration database and contains both normalized integration data and compatibility/legacy columns. Some existing application entities use numeric internal `id` values while some integrated tables also carry team-specific string patient codes such as `P001`. Therefore the dump should be treated as the **shared integration database artifact**, while the existing Spring/Mongo service contracts remain intact.

For the safest local run, start PostgreSQL from `docker-compose.database.yml` and then start only the application service(s) required for the module you are demonstrating.

## Verification

The final package includes the original integrated frontend/backend source plus this database integration folder. No existing source files, UI components, routes, models, or milestone folders were removed or overwritten during the merge.
