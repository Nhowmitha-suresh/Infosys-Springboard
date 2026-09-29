-- =========================================
-- ml_patient_data
-- =========================================
-- This table is queried directly by predict.py and shap_explain.py
-- (see PATIENT_FEATURE_QUERY in both files) but was not present in
-- any of the uploaded SQL files. Columns, types, and nullability below
-- are taken directly from how the Python code uses each field --
-- nothing here is invented beyond what the code already assumes.
--
-- Ownership note: per your project split, this table is normally
-- owned by the database/integration team. This script is provided so
-- the Model Versioning + SHAP backend has something to run against
-- locally; confirm with that team before treating this as final.

CREATE TABLE IF NOT EXISTS ml_patient_data (
    patient_id       VARCHAR(10)   PRIMARY KEY,
    age              INTEGER       NOT NULL,
    gender           VARCHAR(20)   NOT NULL,
    heart_rate       NUMERIC(6,2)  NOT NULL,
    spo2              NUMERIC(6,2)  NOT NULL,
    systolic_bp      NUMERIC(6,2)  NOT NULL,
    diastolic_bp     NUMERIC(6,2)  NOT NULL,
    temperature      NUMERIC(6,2)  NOT NULL,
    bmi              NUMERIC(6,2)  NOT NULL,
    glucose          NUMERIC(6,2)  NOT NULL,
    cholesterol      NUMERIC(6,2)  NOT NULL,
    smoking_status   VARCHAR(20)   NOT NULL
);

-- A handful of sample rows so /predict and /explain can be tested
-- end-to-end without waiting on the data team. Safe to delete once
-- real patient data is loaded -- ON CONFLICT DO NOTHING makes this
-- script safe to re-run without duplicating rows.
INSERT INTO ml_patient_data
    (patient_id, age, gender, heart_rate, spo2, systolic_bp, diastolic_bp,
     temperature, bmi, glucose, cholesterol, smoking_status)
VALUES
    ('P001', 58, 'Male',   88, 96.5, 145, 92, 37.1, 29.4, 118, 210, 'Former'),
    ('P002', 34, 'Female', 72, 98.2, 112, 74, 36.8, 22.1,  92, 165, 'Never'),
    ('P003', 67, 'Male',   95, 94.8, 158, 98, 37.4, 31.2, 142, 245, 'Current')
ON CONFLICT (patient_id) DO NOTHING;
