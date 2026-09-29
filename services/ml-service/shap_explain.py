"""
shap_explain.py

SHAP Explainability backend for the Medisphere-ML project.

The original version of this file was a one-shot batch script (loaded
the model once, connected to Postgres once, explained every patient in
the table, then exited). Its SHAP-shape-handling logic was solid and
is preserved here -- it has just been reorganized into a single
reusable function that explains one patient at a time:

    explain_patient(patient_id) -> dict

What it does, step by step:
    1. Looks up the patient's row in ml_patient_data.
    2. Looks up that patient's most recent prediction in `ml_predictions`
       (matched by patient_id -- never by row position/order).
    3. Loads the model version that produced THAT prediction
       (predictions.model_version_id), not necessarily whatever model
       is currently active -- so re-explaining an old prediction never
       drifts onto a newer model.
    4. Loads the model + preprocessing pipeline referenced by that
       model version's model_path (cached in memory after first load).
    5. Computes SHAP values for the predicted class, handling every
       SHAP output shape the original script accounted for (list of
       per-class arrays / 3-D array / 2-D array).
    6. Ranks features by absolute SHAP value.
    7. Stores the explanation in shap_explanations. If this prediction
       has already been explained, the existing rows are reused instead
       of inserting duplicates.
    8. Returns a clean, JSON-serializable dict.
"""

from pathlib import Path

import numpy as np
import pandas as pd
import joblib
import psycopg2
import shap

from db import get_connection, DatabaseConfigError, DatabaseConnectionError


class ShapExplainError(Exception):
    """Base class for all explain_patient errors."""


class PatientNotFoundError(ShapExplainError):
    """Raised when patient_id has no row in ml_patient_data."""


class PredictionNotFoundError(ShapExplainError):
    """Raised when the patient has no prediction yet to explain."""


class ModelUnavailableError(ShapExplainError):
    """Raised when the model version behind a prediction can't be loaded."""


_PROJECT_ROOT = Path(__file__).resolve().parent

# In-memory cache of loaded model packages + SHAP explainers, keyed by
# model_path. Nothing here runs at import time or touches the DB --
# it's just an empty dict until the first explain_patient() call.
_MODEL_CACHE = {}

# Lazily populated on first DB access: whether shap_explanations has
# the optional base_value / predicted_output columns added by
# database/updates.sql. None = "not checked yet".
_HAS_OPTIONAL_COLUMNS = None

_PATIENT_FEATURE_QUERY = """
SELECT
    patient_id, age, gender, heart_rate, spo2, systolic_bp,
    diastolic_bp, temperature, bmi, glucose, cholesterol, smoking_status
FROM ml_patient_data
WHERE patient_id = %s;
"""


def explain_patient(patient_id):
    """
    Generate (or fetch, if already stored) the SHAP explanation for a
    patient's most recent prediction.

    Returns:
        {
            "patient_id": "P001",
            "prediction_id": 123,
            "prediction": 1,
            "risk_level": "High Risk",
            "model_version": "v1.0",
            "explanation": [
                {"feature": "systolic_bp", "value": 145.0,
                 "shap_value": 0.18, "rank": 1},
                ...
            ]
        }

    Raises:
        ShapExplainError: invalid patient_id, or an unexpected SHAP
            output shape.
        PatientNotFoundError: no such patient in ml_patient_data.
        PredictionNotFoundError: patient exists but has no prediction yet.
        ModelUnavailableError: the model version behind the prediction
            is missing from the DB, or its file can't be loaded.
    """
    if not isinstance(patient_id, str) or not patient_id.strip():
        raise ShapExplainError("patient_id must be a non-empty string.")

    try:
        conn = get_connection()
    except (DatabaseConfigError, DatabaseConnectionError) as exc:
        raise ShapExplainError(str(exc)) from exc

    try:
        patient_row = _get_patient_row(conn, patient_id)
        if patient_row is None:
            raise PatientNotFoundError(f"Patient '{patient_id}' was not found.")

        prediction_row = _get_latest_prediction(conn, patient_id)
        if prediction_row is None:
            raise PredictionNotFoundError(
                f"Patient '{patient_id}' has no prediction yet. "
                "Generate a prediction for this patient before requesting an explanation."
            )
        prediction_id, model_version_id, prediction_result, _confidence, _ts = prediction_row

        if model_version_id is None:
            raise ModelUnavailableError(
                f"Prediction {prediction_id} for patient '{patient_id}' has no "
                "associated model version and cannot be explained."
            )

        model_version_row = _get_model_version(conn, model_version_id)
        if model_version_row is None:
            raise ModelUnavailableError(
                f"Model version {model_version_id} referenced by prediction "
                f"{prediction_id} no longer exists in model_versions."
            )
        _version_id, _model_name, version_number, model_path = model_version_row

        # Idempotency: if this prediction was already explained, reuse
        # the stored rows instead of recomputing + reinserting.
        existing_rows = _get_existing_shap_rows(conn, prediction_id)
        if existing_rows:
            explanation = [
                {"feature": name, "value": float(value), "shap_value": float(shap_val), "rank": int(rank)}
                for name, value, shap_val, rank in existing_rows
            ]
            return _build_response(patient_id, prediction_id, prediction_result, version_number, explanation)

        package, explainer = _load_model_and_explainer(model_path)
        model_features = package["features"]

        missing = [f for f in model_features if f not in patient_row.index]
        if missing:
            raise ShapExplainError(
                f"Patient '{patient_id}' record is missing required feature(s): {missing}"
            )

        X = pd.DataFrame([patient_row[model_features]])
        X_transformed = package["preprocessor"].transform(X)
        X_dense = X_transformed.toarray() if hasattr(X_transformed, "toarray") else np.asarray(X_transformed)

        feature_names = package["preprocessor"].get_feature_names_out(model_features)

        shap_row, base_value = _compute_shap_for_row(explainer, X_dense, int(prediction_result))

        ranked_indices = np.argsort(-np.abs(shap_row))
        explanation = [
            {
                "feature": str(feature_names[idx]),
                "value": float(X_dense[0, idx]),
                "shap_value": float(shap_row[idx]),
                "rank": rank,
            }
            for rank, idx in enumerate(ranked_indices, start=1)
        ]

        predicted_output = float(base_value + shap_row.sum()) if base_value is not None else None

        _insert_shap_rows(conn, prediction_id, explanation, base_value, predicted_output)
        conn.commit()

        return _build_response(patient_id, prediction_id, prediction_result, version_number, explanation)

    except psycopg2.Error as exc:
        conn.rollback()
        raise ShapExplainError(f"Database error: {exc}") from exc
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


def _get_latest_prediction(conn, patient_id):
    """
    Most recent prediction for this patient, matched strictly by
    patient_id (never by row position). "Most recent" = latest
    prediction_timestamp, falling back to the highest prediction_id.
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT prediction_id, model_version_id, prediction_result,
                   confidence_score, prediction_timestamp
            FROM ml_predictions
            WHERE patient_id = %s
            ORDER BY prediction_timestamp DESC NULLS LAST, prediction_id DESC
            LIMIT 1;
            """,
            (patient_id,),
        )
        return cur.fetchone()


def _get_model_version(conn, version_id):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT version_id, model_name, version_number, model_path "
            "FROM model_versions WHERE version_id = %s;",
            (version_id,),
        )
        return cur.fetchone()


def _get_existing_shap_rows(conn, prediction_id):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT feature_name, feature_value, shap_value, feature_rank "
            "FROM shap_explanations WHERE prediction_id = %s "
            "ORDER BY feature_rank ASC;",
            (prediction_id,),
        )
        return cur.fetchall()


def _has_optional_columns(conn):
    """Detect (once per process) whether database/updates.sql has been applied."""
    global _HAS_OPTIONAL_COLUMNS
    if _HAS_OPTIONAL_COLUMNS is not None:
        return _HAS_OPTIONAL_COLUMNS

    with conn.cursor() as cur:
        cur.execute(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'shap_explanations' "
            "AND column_name IN ('base_value', 'predicted_output');"
        )
        found = {row[0] for row in cur.fetchall()}

    _HAS_OPTIONAL_COLUMNS = {"base_value", "predicted_output"}.issubset(found)
    return _HAS_OPTIONAL_COLUMNS


def _insert_shap_rows(conn, prediction_id, explanation, base_value, predicted_output):
    has_optional = _has_optional_columns(conn)

    if has_optional:
        insert_sql = (
            "INSERT INTO shap_explanations "
            "(prediction_id, feature_name, feature_value, shap_value, feature_rank, "
            "base_value, predicted_output) VALUES (%s, %s, %s, %s, %s, %s, %s);"
        )
    else:
        insert_sql = (
            "INSERT INTO shap_explanations "
            "(prediction_id, feature_name, feature_value, shap_value, feature_rank) "
            "VALUES (%s, %s, %s, %s, %s);"
        )

    with conn.cursor() as cur:
        for item in explanation:
            params = (prediction_id, item["feature"], item["value"], item["shap_value"], item["rank"])
            if has_optional:
                params = params + (base_value, predicted_output)
            cur.execute(insert_sql, params)


def _load_model_and_explainer(model_path):
    """Load (and cache) the model package + a TreeExplainer for it."""
    if model_path in _MODEL_CACHE:
        cached = _MODEL_CACHE[model_path]
        return cached["package"], cached["explainer"]

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

    try:
        explainer = shap.TreeExplainer(package["model"])
    except Exception as exc:
        raise ModelUnavailableError(f"Could not build SHAP explainer: {exc}") from exc

    _MODEL_CACHE[model_path] = {"package": package, "explainer": explainer}
    return package, explainer


def _compute_shap_for_row(explainer, X_dense, predicted_class):
    """
    Compute SHAP values for a single row and return
    (shap_values_for_predicted_class, base_value).

    Mirrors the shape-handling logic from the original batch script,
    reduced to one row (index 0):
        - list of per-class arrays  -> pick predicted_class's array
        - 3-D array (samples, features, classes) -> index [0, :, predicted_class]
        - 2-D array (samples, features) -> single-output model, use as-is
    """
    raw = explainer.shap_values(X_dense)
    expected_value = explainer.expected_value

    if isinstance(raw, list):
        class_array = np.asarray(raw[predicted_class])
        shap_row = class_array[0]
        base_value = _extract_expected_value(expected_value, predicted_class)
    else:
        shap_array = np.asarray(raw)
        if shap_array.ndim == 3:
            shap_row = shap_array[0, :, predicted_class]
            base_value = _extract_expected_value(expected_value, predicted_class)
        elif shap_array.ndim == 2:
            shap_row = shap_array[0]
            base_value = _extract_expected_value(expected_value, None)
        else:
            raise ShapExplainError(f"Unexpected SHAP output shape: {shap_array.shape}")

    return shap_row, base_value


def _extract_expected_value(expected_value, class_index):
    try:
        if isinstance(expected_value, (list, tuple, np.ndarray)):
            arr = np.asarray(expected_value).ravel()
            if class_index is not None and len(arr) > class_index:
                return float(arr[class_index])
            return float(arr[0])
        return float(expected_value)
    except Exception:
        return None


def _build_response(patient_id, prediction_id, prediction_result, version_number, explanation):
    prediction_result = int(prediction_result)
    return {
        "patient_id": patient_id,
        "prediction_id": int(prediction_id),
        "prediction": prediction_result,
        "risk_level": "High Risk" if prediction_result == 1 else "Low Risk",
        "model_version": version_number,
        "explanation": explanation,
    }
