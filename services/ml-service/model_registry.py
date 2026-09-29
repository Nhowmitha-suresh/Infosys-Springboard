"""
model_registry.py

Model Versioning service for the Medisphere-ML backend.

Operates entirely on the existing `model_versions` table (see
database/ml_model_versioning.sql). No new tables are created here.

Convention used by this module:
    status == 'Active'   -> the one model version currently used for
                             new predictions (there should be at most one).
    status == 'Archived' -> a retired version, kept for history/audit.
    status == 'Inactive' -> a registered version that has never been
                             activated yet (the default for register_model).

Every function returns plain Python dicts (JSON-serializable) or raises
one of the exceptions below -- it never lets a raw psycopg2 exception
escape, and it never prints connection strings, passwords, or full
tracebacks containing patient data.
"""

from decimal import Decimal
from datetime import date, datetime

import psycopg2

from db import get_connection, DatabaseConfigError, DatabaseConnectionError


class ModelRegistryError(Exception):
    """Base class for all model_registry errors."""


class ModelNotFoundError(ModelRegistryError):
    """Raised when a requested model version does not exist."""


class ModelValidationError(ModelRegistryError):
    """Raised when input data for a new/updated model version is invalid."""


# Columns of model_versions, in a stable order, used to build dicts from
# cursor rows without depending on cursor.description ordering guesses.
_MODEL_COLUMNS = [
    "version_id",
    "model_name",
    "version_number",
    "algorithm",
    "dataset_name",
    "accuracy",
    "precision_score",
    "recall_score",
    "f1_score",
    "training_date",
    "model_path",
    "status",
]

_MODEL_SELECT_COLUMNS_SQL = ", ".join(_MODEL_COLUMNS)

_REQUIRED_REGISTER_FIELDS = [
    "model_name",
    "version_number",
    "algorithm",
    "dataset_name",
    "accuracy",
    "precision_score",
    "recall_score",
    "f1_score",
    "model_path",
]

_SCORE_FIELDS = ["accuracy", "precision_score", "recall_score", "f1_score"]


def _json_safe(value):
    """Convert DB-native types (Decimal, datetime, date) to JSON-safe types."""
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


def _row_to_dict(row):
    return {
        column: _json_safe(value)
        for column, value in zip(_MODEL_COLUMNS, row)
    }


def _run_query(query, params=None, fetch="all"):
    """
    Open a connection, run one query, fetch results, close the connection.

    fetch: "all" | "one" | "none"
    Returns the raw rows (list of tuples, a single tuple, or None).
    Wraps connection and query errors into ModelRegistryError subclasses.
    """
    try:
        conn = get_connection()
    except (DatabaseConfigError, DatabaseConnectionError) as exc:
        raise ModelRegistryError(str(exc)) from exc

    try:
        with conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params or ())
                if fetch == "all":
                    return cursor.fetchall()
                if fetch == "one":
                    return cursor.fetchone()
                return None
    except psycopg2.Error as exc:
        raise ModelRegistryError(f"Database error: {exc}") from exc
    finally:
        conn.close()


def get_all_models():
    """
    Return every model version in the registry, newest first.

    Returns:
        list[dict]
    """
    rows = _run_query(
        f"SELECT {_MODEL_SELECT_COLUMNS_SQL} FROM model_versions "
        "ORDER BY version_id DESC;",
        fetch="all",
    )
    return [_row_to_dict(row) for row in rows]


def get_model_by_id(version_id):
    """
    Return a single model version by its version_id.

    Raises:
        ModelValidationError: version_id is not a positive integer.
        ModelNotFoundError: no such version_id exists.
    """
    _validate_version_id(version_id)

    row = _run_query(
        f"SELECT {_MODEL_SELECT_COLUMNS_SQL} FROM model_versions "
        "WHERE version_id = %s;",
        params=(version_id,),
        fetch="one",
    )
    if row is None:
        raise ModelNotFoundError(f"Model version {version_id} was not found.")
    return _row_to_dict(row)


def get_active_model():
    """
    Return the currently active model version.

    If more than one row is somehow marked 'Active' (e.g. a version was
    inserted directly by train_model.py without going through this
    module), the most recently created one wins -- but this should not
    happen in normal operation since activate_model() always archives
    the previous active version first.

    Raises:
        ModelNotFoundError: no active model version exists.
    """
    row = _run_query(
        f"SELECT {_MODEL_SELECT_COLUMNS_SQL} FROM model_versions "
        "WHERE status = 'Active' "
        "ORDER BY version_id DESC LIMIT 1;",
        fetch="one",
    )
    if row is None:
        raise ModelNotFoundError("No active model version found.")
    return _row_to_dict(row)


def register_model(data):
    """
    Insert a new model version row.

    `data` must be a dict containing at least:
        model_name, version_number, algorithm, dataset_name,
        accuracy, precision_score, recall_score, f1_score, model_path
    `training_date` is optional (defaults to CURRENT_TIMESTAMP if omitted).

    A newly registered model is always inserted with status='Inactive'.
    It does NOT become the active model until activate_model() is called
    -- this avoids ever ending up with two 'Active' rows via POST /models
    alone, and keeps "register" and "activate" as separate, explicit
    operations as required by the spec.

    Raises:
        ModelValidationError: required fields missing/invalid, or a
            model with the same model_name + version_number already exists.
    """
    if not isinstance(data, dict):
        raise ModelValidationError("Request body must be a JSON object.")

    missing = [f for f in _REQUIRED_REGISTER_FIELDS if data.get(f) in (None, "")]
    if missing:
        raise ModelValidationError(
            f"Missing required field(s): {', '.join(missing)}"
        )

    for field in ["model_name", "version_number", "algorithm", "dataset_name", "model_path"]:
        if not isinstance(data[field], str) or not data[field].strip():
            raise ModelValidationError(f"'{field}' must be a non-empty string.")

    for field in _SCORE_FIELDS:
        value = data[field]
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ModelValidationError(f"'{field}' must be a number.")
        if not (0.0 <= float(value) <= 1.0):
            raise ModelValidationError(f"'{field}' must be between 0 and 1.")

    training_date = data.get("training_date")  # optional

    # Guard against accidental duplicate registration of the same version.
    existing = _run_query(
        "SELECT version_id FROM model_versions "
        "WHERE model_name = %s AND version_number = %s;",
        params=(data["model_name"], data["version_number"]),
        fetch="one",
    )
    if existing is not None:
        raise ModelValidationError(
            f"Model '{data['model_name']}' version '{data['version_number']}' "
            "already exists."
        )

    if training_date:
        insert_sql = (
            "INSERT INTO model_versions "
            "(model_name, version_number, algorithm, dataset_name, accuracy, "
            "precision_score, recall_score, f1_score, training_date, model_path, status) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) "
            f"RETURNING {_MODEL_SELECT_COLUMNS_SQL};"
        )
        params = (
            data["model_name"], data["version_number"], data["algorithm"],
            data["dataset_name"], data["accuracy"], data["precision_score"],
            data["recall_score"], data["f1_score"], training_date,
            data["model_path"], "Inactive",
        )
    else:
        insert_sql = (
            "INSERT INTO model_versions "
            "(model_name, version_number, algorithm, dataset_name, accuracy, "
            "precision_score, recall_score, f1_score, model_path, status) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) "
            f"RETURNING {_MODEL_SELECT_COLUMNS_SQL};"
        )
        params = (
            data["model_name"], data["version_number"], data["algorithm"],
            data["dataset_name"], data["accuracy"], data["precision_score"],
            data["recall_score"], data["f1_score"],
            data["model_path"], "Inactive",
        )

    try:
        row = _run_query(insert_sql, params=params, fetch="one")
    except ModelRegistryError as exc:
        # A bad training_date string (e.g. not a real timestamp) surfaces
        # here as a Postgres error -- treat it as a validation problem.
        raise ModelValidationError(f"Could not register model version: {exc}") from exc

    return _row_to_dict(row)


def activate_model(version_id):
    """
    Mark the given model version 'Active' and archive whichever version
    (if any) was previously 'Active'. Both updates happen in a single
    transaction so we never end up with zero or two active versions.

    Raises:
        ModelValidationError: version_id is not a positive integer.
        ModelNotFoundError: no such version_id exists.
    """
    _validate_version_id(version_id)

    try:
        conn = get_connection()
    except (DatabaseConfigError, DatabaseConnectionError) as exc:
        raise ModelRegistryError(str(exc)) from exc

    try:
        with conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT version_id FROM model_versions WHERE version_id = %s;",
                    (version_id,),
                )
                if cursor.fetchone() is None:
                    raise ModelNotFoundError(
                        f"Model version {version_id} was not found."
                    )

                # Archive whatever is currently active (excluding the
                # target itself, in case it's already active).
                cursor.execute(
                    "UPDATE model_versions SET status = 'Archived' "
                    "WHERE status = 'Active' AND version_id != %s;",
                    (version_id,),
                )

                cursor.execute(
                    "UPDATE model_versions SET status = 'Active' "
                    f"WHERE version_id = %s RETURNING {_MODEL_SELECT_COLUMNS_SQL};",
                    (version_id,),
                )
                row = cursor.fetchone()
    except psycopg2.Error as exc:
        raise ModelRegistryError(f"Database error: {exc}") from exc
    finally:
        conn.close()

    return _row_to_dict(row)


def archive_model(version_id):
    """
    Mark the given model version 'Archived'. Does not delete anything
    and does not touch any other row.

    Raises:
        ModelValidationError: version_id is not a positive integer.
        ModelNotFoundError: no such version_id exists.
    """
    _validate_version_id(version_id)

    row = _run_query(
        "UPDATE model_versions SET status = 'Archived' "
        f"WHERE version_id = %s RETURNING {_MODEL_SELECT_COLUMNS_SQL};",
        params=(version_id,),
        fetch="one",
    )
    if row is None:
        raise ModelNotFoundError(f"Model version {version_id} was not found.")
    return _row_to_dict(row)


def _validate_version_id(version_id):
    if isinstance(version_id, bool) or not isinstance(version_id, int) or version_id <= 0:
        raise ModelValidationError("version_id must be a positive integer.")
