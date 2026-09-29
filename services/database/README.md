# Database Notes — Medisphere Healthcare Platform

One PostgreSQL database (`medisphere`), owned by three services:

| Owner | Tables | Created by |
|---|---|---|
| **backend/** (Java / Spring Boot) | `users`, `patients`, `appointments`, `vitals`, `alerts`, `care_plans`, `consents`, `consent_audit_logs`, `twins`, `reports`, `prescriptions`, `allergies`, **`predictions`** | Hibernate `ddl-auto=update` on startup, seeded by `backend/src/main/resources/data.sql` |
| **ml-service/** (Python / Flask) | `model_versions`, **`ml_predictions`**, `shap_explanations`, `ml_patient_data` | The `.sql` files in this folder |
| **monitoring-service/** (Node / Express) | `clinical_rules`, `rule_executions`, `notifications` | `z_monitoring_schema.sql` in this folder |

## Why two `predictions`-ish tables?

Milestone 1's `predictions` table backs the existing, already-wired
**heuristic risk score** feature (`PredictionController` /
`PredictionService` / the `/predictions` page): it runs against real
`patients` rows (numeric IDs), factors in condition + latest vitals, and
raises an `Alert` on high risk. It is genuinely part of the app already.

Milestone 2's `predictions` table backed a **separately trained Random
Forest model** with real SHAP explainability, keyed by its own
`ml_patient_data` feature table (string IDs like `P001`). These are two
different data sources and two different tables — merging them would have
either broken the working heuristic feature or silently mixed unrelated
schemas (`risk_percent` vs `confidence_score`, `Long` vs `VARCHAR(10)`
patient IDs, etc).

**Resolution:** Milestone 2's table was renamed `ml_predictions`
everywhere (SQL + `ml-service/predict.py` + `ml-service/shap_explain.py`)
so both features coexist without collision. Do not rename it back.

## Running the ML + monitoring schema

```bash
psql -U postgres -d medisphere -f database/ml_model_versioning.sql
psql -U postgres -d medisphere -f database/ml_patient_data.sql
psql -U postgres -d medisphere -f database/shap_explainability.sql
psql -U postgres -d medisphere -f database/updates.sql
psql -U postgres -d medisphere -f database/z_monitoring_schema.sql
```

Order matters: `ml_model_versioning.sql` must run before
`shap_explainability.sql` (foreign key to `ml_predictions`) and
`updates.sql` (adds columns to both `model_versions` and
`shap_explanations`); `z_monitoring_schema.sql` (monitoring-service's
`clinical_rules`/`rule_executions`/`notifications`) must run last, since
it has foreign keys into both `ml_predictions` and `ml_patient_data`. All
five are also alphabetically in that order (the `z` prefix is there
specifically to guarantee this), so `docker-compose.yml` mounting this
whole folder as `/docker-entrypoint-initdb.d` on a fresh Postgres
container runs them correctly automatically. `z_monitoring_schema.sql`
also seeds 5 default clinical rules, so the rule catalog isn't empty on
first boot either.

`ml_patient_data.sql` seeds 3 demo patients (`P001`, `P002`, `P003`) so
`/predict` and `/explain/<id>` work out of the box. The Java backend's
`patients` table is unrelated and uses its own demo data (`101`-`105`,
see `backend/src/main/resources/data.sql`) — don't confuse the two ID
spaces when testing.

## The Java backend's own tables

Nothing to run manually — `spring.jpa.hibernate.ddl-auto=update` creates/
updates them from the JPA entities on every backend startup, and
`data.sql` (guarded by `NOT EXISTS` checks, safe to re-run) seeds demo
users, patients, appointments, and more.
