"""
predict.py

Prediction backend for the Medisphere-ML project.

Exposes a reusable function:

    predict_patient(patient_id) -> dict

for use by the Flask API (POST /predict). It uses the currently ACTIVE
model version from model_registry (never a hardcoded version number),
so predictions automatically follow whichever model is active.

Running this file directly (`python predict.py`) preserves the
original batch behavior -- predicting for every patient in
ml_patient_data and printing a summary -- but that now only happens
when the script is executed directly, never on import. Previously the
whole batch job ran as a side effect of `from predict import
predict_patient`, which meant every Flask server start silently
re-predicted for every patient. That's fixed here.
"""

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import psycopg2

from db import get_connection, DatabaseConfigError, DatabaseConnectionError
from model_registry import get_active_model, ModelNotFoundError, ModelRegistryError


class PredictionError(Exception):
    """Base class for all predict_patient errors."""


class PatientNotFoundError(PredictionError):
    """Raised when patient_id has no row in ml_patient_data."""


class NoActiveModelError(PredictionError):
    """Raised when there is no active model version to predict with."""


class ModelUnavailableError(PredictionError):
    """Raised when the active model version's file can't be loaded."""


_PROJECT_ROOT = Path(__file__).resolve().parent

# In-memory cache of loaded model packages, keyed by model_path.
_MODEL_CACHE = {}

_PATIENT_FEATURE_QUERY = """
SELECT
    patient_id, age, gender, heart_rate, spo2, systolic_bp,
    diastolic_bp, temperature, bmi, glucose, cholesterol, smoking_status
FROM ml_patient_data
WHERE patient_id = %s;
"""


def predict_patient(patient_id):
    """
    Generate a fresh prediction for one patient using the currently
    ACTIVE model version, store it in `ml_predictions`, and return a
    JSON-serializable result:

        {
            "patient_id": "P001",
            "prediction_id": 123,
            "prediction": 1,
            "risk_level": "High Risk",
            "confidence_score": 0.87,
            "model_version": "v1.0",
            "model_version_id": 1
        }

    Raises:
        PredictionError: invalid patient_id, missing features, or a DB error.
        PatientNotFoundError: no such patient in ml_patient_data.
        NoActiveModelError: no model version is currently active.
        ModelUnavailableError: the active model's file can't be loaded.
    """
    if not isinstance(patient_id, str) or not patient_id.strip():
        raise PredictionError("patient_id must be a non-empty string.")

    try:
        conn = get_connection()
    except (DatabaseConfigError, DatabaseConnectionError) as exc:
        raise PredictionError(str(exc)) from exc

    try:
        patient_row = _get_patient_row(conn, patient_id)
        if patient_row is None:
            raise PatientNotFoundError(f"Patient '{patient_id}' was not found.")

        try:
            active_model = get_active_model()
        except ModelNotFoundError as exc:
            raise NoActiveModelError(str(exc)) from exc
        except ModelRegistryError as exc:
            raise PredictionError(str(exc)) from exc

        model_version_id = active_model["version_id"]
        version_number = active_model["version_number"]
        model_path = active_model["model_path"]

        package = _load_model_package(model_path)
        model = package["model"]
        preprocessor = package["preprocessor"]
        features = package["features"]

        missing = [f for f in features if f not in patient_row.index]
        if missing:
            raise PredictionError(
                f"Patient '{patient_id}' record is missing required feature(s): {missing}"
            )

        X = pd.DataFrame([patient_row[features]])
        X_transformed = preprocessor.transform(X)

        prediction = int(model.predict(X_transformed)[0])
        probabilities = model.predict_proba(X_transformed)[0]
        confidence = float(np.max(probabilities))

        prediction_id = _insert_prediction(
            conn, patient_id, model_version_id, prediction, confidence
        )
        conn.commit()

        return {
            "patient_id": patient_id,
            "prediction_id": prediction_id,
            "prediction": prediction,
            "risk_level": "High Risk" if prediction == 1 else "Low Risk",
            "confidence_score": confidence,
            "model_version": version_number,
            "model_version_id": model_version_id,
        }
    except psycopg2.Error as exc:
        conn.rollback()
        raise PredictionError(f"Database error: {exc}") from exc
    finally:
        conn.close()


# =========================================================
# Internal helpers
# =========================================================

def _get_patient_row(conn, patient_id):
    df = pd.read_sql_query(_PATIENT_FEATURE_QUERY, conn, params=(patient_id,))
    if df.empty:
        return None
    return df.iloc[0]


def _load_model_package(model_path):
    if model_path in _MODEL_CACHE:
        return _MODEL_CACHE[model_path]

    resolved = Path(model_path)
    if not resolved.is_absolute():
        resolved = _PROJECT_ROOT / model_path

    if not resolved.exists():
        raise ModelUnavailableError(f"Model file not found on disk: {resolved}")

    try:
        package = joblib.load(resolved)
    except Exception as exc:
        raise ModelUnavailableError(f"Could not load model file '{resolved}': {exc}") from exc

    for key in ("model", "preprocessor", "features"):
        if key not in package:
            raise ModelUnavailableError(f"Model package at '{resolved}' is missing '{key}'.")

    _MODEL_CACHE[model_path] = package
    return package


def _insert_prediction(conn, patient_id, model_version_id, prediction, confidence):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO ml_predictions
                (patient_id, model_version_id, prediction_result, confidence_score)
            VALUES (%s, %s, %s, %s)
            RETURNING prediction_id;
            """,
            (patient_id, model_version_id, prediction, confidence),
        )
        return cur.fetchone()[0]


def _run_batch_prediction():
    """
    Original batch behavior, preserved: predict for every patient in
    ml_patient_data and print a summary. Only runs when this file is
    executed directly (`python predict.py`) -- never on import.
    """
    conn = get_connection()
    try:
        df = pd.read_sql_query(
            "SELECT patient_id FROM ml_patient_data ORDER BY patient_id;", conn
        )
    finally:
        conn.close()

    print(f"Patients found: {len(df)}\n")
    print("===================================")
    print("PREDICTIONS GENERATED")
    print("===================================")

    total = 0
    for patient_id in df["patient_id"]:
        try:
            result = predict_patient(patient_id)
            print(
                f"{result['patient_id']} -> {result['risk_level']} "
                f"(Confidence: {result['confidence_score']:.2%}, "
                f"Model: {result['model_version']})"
            )
            total += 1
        except PredictionError as exc:
            print(f"{patient_id} -> FAILED: {exc}")

    print(f"\nTotal predictions inserted: {total}")


if __name__ == "__main__":
    _run_batch_prediction()
