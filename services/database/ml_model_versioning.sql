-- ============================================
-- 07_ml_model_versioning.sql
-- Medisphere ML - Model Versioning & Predictions
-- ============================================

CREATE TABLE IF NOT EXISTS model_versions (
    version_id BIGSERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    version_number VARCHAR(20) NOT NULL,
    algorithm VARCHAR(100),
    dataset_name VARCHAR(150),
    accuracy NUMERIC(6,4),
    precision_score NUMERIC(6,4),
    recall_score NUMERIC(6,4),
    f1_score NUMERIC(6,4),
    training_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    model_path TEXT,
    status VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS ml_predictions (
    prediction_id BIGSERIAL PRIMARY KEY,
    patient_id VARCHAR(10) NOT NULL,
    model_version_id BIGINT,
    prediction_result INTEGER,
    confidence_score NUMERIC(6,4),
    prediction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_prediction_model_version
        FOREIGN KEY (model_version_id)
        REFERENCES model_versions(version_id)
);

CREATE INDEX IF NOT EXISTS idx_ml_predictions_patient
ON ml_predictions(patient_id);

CREATE INDEX IF NOT EXISTS idx_ml_predictions_model_version
ON ml_predictions(model_version_id);

CREATE INDEX IF NOT EXISTS idx_ml_predictions_timestamp
ON ml_predictions(prediction_timestamp);