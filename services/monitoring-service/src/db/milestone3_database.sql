-- ============================================================
-- Milestone 3 Database Setup — Clinical Rule Engine + Mobile Notifications
--
-- ADAPTED FOR THE MERGED PLATFORM (integration pass):
-- This script originally referenced placeholder tables
-- `predictions(prediction_id, patient_id)` and `patients(patient_id)`.
-- Those never existed under those names in the merged Milestone 1+2
-- platform:
--   - the Java backend's patient/prediction tables are `patients(id)`
--     and `predictions(id)` (numeric surrogate keys, no `patient_id`/
--     `prediction_id` columns) — these back real CRUD, not the ML
--     feature set Milestone 3 was designed against.
--   - the actual VARCHAR-keyed, ML-facing tables from Milestone 2 are
--     `ml_patient_data(patient_id)` and `ml_predictions(prediction_id,
--     patient_id)` — same demo IDs (P001-P003) the ML Models section
--     (Prediction / SHAP / Model Versioning) already runs against.
-- The two foreign keys below now point at the tables that actually
-- exist, so this applies cleanly against the real database. No other
-- part of this schema was changed.
--
-- Prerequisite (already satisfied by database/ml_patient_data.sql and
-- database/ml_model_versioning.sql, which run before this file):
--   ml_patient_data(patient_id)
--   ml_predictions(prediction_id, patient_id)
--
-- This script contains structure (+ default rule catalog seed). It
-- does NOT insert patient/prediction data.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. CLINICAL RULES
-- ============================================================

CREATE TABLE IF NOT EXISTS clinical_rules (
    rule_id BIGSERIAL PRIMARY KEY,
    rule_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    condition TEXT NOT NULL,
    action TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. RULE EXECUTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS rule_executions (
    execution_id BIGSERIAL PRIMARY KEY,
    rule_id BIGINT NOT NULL,
    patient_id VARCHAR(100) NOT NULL,
    prediction_id BIGINT NOT NULL,
    triggered BOOLEAN NOT NULL,
    result TEXT NOT NULL,
    executed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rule_execution_rule
        FOREIGN KEY (rule_id)
        REFERENCES clinical_rules(rule_id),

    CONSTRAINT fk_rule_execution_prediction
        FOREIGN KEY (prediction_id)
        REFERENCES ml_predictions(prediction_id),

    CONSTRAINT fk_rule_execution_patient
        FOREIGN KEY (patient_id)
        REFERENCES ml_patient_data(patient_id)
);

-- ============================================================
-- 3. NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    patient_id VARCHAR(100) NOT NULL,
    rule_id BIGINT NOT NULL,
    prediction_id BIGINT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITHOUT TIME ZONE,
    read_at TIMESTAMP WITHOUT TIME ZONE,

    CONSTRAINT fk_notification_rule
        FOREIGN KEY (rule_id)
        REFERENCES clinical_rules(rule_id),

    CONSTRAINT fk_notification_prediction
        FOREIGN KEY (prediction_id)
        REFERENCES ml_predictions(prediction_id),

    CONSTRAINT fk_notification_patient
        FOREIGN KEY (patient_id)
        REFERENCES ml_patient_data(patient_id),

    CONSTRAINT notifications_status_check
        CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'))
);

-- ============================================================
-- 4. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_rule_executions_patient
    ON rule_executions(patient_id);

CREATE INDEX IF NOT EXISTS idx_rule_executions_rule
    ON rule_executions(rule_id);

CREATE INDEX IF NOT EXISTS idx_notifications_patient
    ON notifications(patient_id);

CREATE INDEX IF NOT EXISTS idx_notifications_status
    ON notifications(status);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
    ON notifications(created_at);

-- ============================================================
-- 5. AUTO-UPDATE updated_at FOR CLINICAL RULES
-- ============================================================

CREATE OR REPLACE FUNCTION update_clinical_rule_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clinical_rules_updated_at
ON clinical_rules;

CREATE TRIGGER trg_clinical_rules_updated_at
BEFORE UPDATE ON clinical_rules
FOR EACH ROW
EXECUTE FUNCTION update_clinical_rule_timestamp();

-- ============================================================
-- 6. VIEW: PATIENT NOTIFICATIONS
-- ============================================================

CREATE OR REPLACE VIEW patient_notifications AS
SELECT
    n.notification_id,
    n.patient_id,
    n.prediction_id,
    r.rule_name,
    r.description AS rule_description,
    n.notification_type,
    n.title,
    n.message,
    n.status,
    n.created_at,
    n.sent_at,
    n.read_at
FROM notifications n
LEFT JOIN clinical_rules r
    ON n.rule_id = r.rule_id;

-- ============================================================
-- 7. VIEW: CLINICAL RULE RESULTS
-- ============================================================

CREATE OR REPLACE VIEW clinical_rule_results AS
SELECT
    e.execution_id,
    e.patient_id,
    e.prediction_id,
    r.rule_id,
    r.rule_name,
    r.condition,
    e.triggered,
    e.result,
    e.executed_at
FROM rule_executions e
JOIN clinical_rules r
    ON e.rule_id = r.rule_id;

-- ============================================================
-- 8. DEFAULT RULE CATALOG (same 5 rules the frontend used to
--    hardcode client-side — see monitoring-service/scripts/seedRules.js
--    for the standalone/manual equivalent of this seed). Seeded here
--    too so a fresh `docker compose up` boots with a working catalog
--    with no extra manual step. Idempotent via the UNIQUE(rule_name)
--    constraint added above.
-- ============================================================

INSERT INTO clinical_rules (rule_name, description, condition, action, is_active) VALUES
    ('Irregular HR pattern (possible AFib)',
     'Heart rate spike with irregular R-R interval variance at rest',
     'context = ''At rest'' AND hr >= 130 AND rr_variance >= 0.12',
     'Notify cardiologist; schedule ECG', TRUE),
    ('Low blood oxygen',
     'SpO2 below 90% for two consecutive readings',
     'spo2 < 90',
     'Page on-call nurse; flag for oxygen check', TRUE),
    ('Sustained tachycardia',
     'Heart rate above 100 bpm sustained at rest',
     'context = ''At rest'' AND hr >= 100 AND hr < 130',
     'Log for care team review', TRUE),
    ('Hypertensive reading',
     'Systolic BP above 150 mmHg',
     'systolic >= 150',
     'Notify care team', TRUE),
    ('Elevated temperature',
     'Body temperature above 38.0 degrees Celsius',
     'temp >= 38.0',
     'Add to nurse round list', TRUE)
ON CONFLICT (rule_name) DO NOTHING;

COMMIT;

-- ============================================================
-- END OF MILESTONE 3 DATABASE SETUP
-- ============================================================
