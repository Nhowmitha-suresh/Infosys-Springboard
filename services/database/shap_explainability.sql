-- ============================================
-- 08_shap_explainability.sql
-- Medisphere ML - SHAP Explainability
-- ============================================

CREATE TABLE IF NOT EXISTS shap_explanations (
    explanation_id BIGSERIAL PRIMARY KEY,
    prediction_id BIGINT NOT NULL,
    feature_name VARCHAR(100),
    feature_value NUMERIC,
    shap_value NUMERIC(12,6),
    feature_rank INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_shap_prediction
        FOREIGN KEY (prediction_id)
        REFERENCES ml_predictions(prediction_id)
);

CREATE INDEX IF NOT EXISTS idx_shap_prediction
ON shap_explanations(prediction_id);

CREATE INDEX IF NOT EXISTS idx_shap_feature
ON shap_explanations(feature_name);

CREATE INDEX IF NOT EXISTS idx_shap_rank
ON shap_explanations(prediction_id, feature_rank);