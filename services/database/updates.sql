-- =========================================
-- MediSphere Milestone 2 Database Updates
-- =========================================

-- Model Versioning UI support
ALTER TABLE model_versions
ADD COLUMN deployed_at TIMESTAMP,
ADD COLUMN training_round INTEGER,
ADD COLUMN total_rounds INTEGER;

-- SHAP Explainability UI support
ALTER TABLE shap_explanations
ADD COLUMN base_value NUMERIC(12,6),
ADD COLUMN predicted_output NUMERIC(12,6);