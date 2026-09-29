from flask import Flask, request, jsonify
from flask_cors import CORS

from model_registry import (
    get_all_models,
    get_model_by_id,
    get_active_model,
    register_model,
    activate_model,
    archive_model,
    ModelNotFoundError,
    ModelValidationError,
    ModelRegistryError,
)

# predict.py now exposes a real predict_patient() function that uses
# the active model version (see predict.py for the fix history) and
# has no import-time side effects, so it's safe to import normally.
try:
    from predict import (
        predict_patient,
        PredictionError,
        PatientNotFoundError as PredictPatientNotFoundError,
        NoActiveModelError,
        ModelUnavailableError as PredictModelUnavailableError,
    )
except Exception as exc:  # noqa: BLE001
    predict_patient = None

    class PredictionError(Exception):
        pass

    class PredictPatientNotFoundError(PredictionError):
        pass

    class NoActiveModelError(PredictionError):
        pass

    class PredictModelUnavailableError(PredictionError):
        pass

    print(f"Warning: predict_patient is not available: {exc}")

# shap_explain.py has been refactored into a proper module: importing
# it only defines functions/classes, it does not touch the DB or the
# model file. Still imported defensively in case the `shap` package
# isn't installed in a given environment.
try:
    from shap_explain import (
        explain_patient,
        ShapExplainError,
        PatientNotFoundError,
        PredictionNotFoundError,
        ModelUnavailableError,
    )
except Exception as exc:  # noqa: BLE001
    explain_patient = None

    class ShapExplainError(Exception):
        pass

    class PatientNotFoundError(ShapExplainError):
        pass

    class PredictionNotFoundError(ShapExplainError):
        pass

    class ModelUnavailableError(ShapExplainError):
        pass

    print(f"Warning: explain_patient is not available yet: {exc}")

app = Flask(__name__)

# Allow the React/Vite dev server to call this API. Restricted to the
# known local dev origins rather than left wide open. Add your deployed
# frontend's origin here too once you have one.
CORS(
    app,
    resources={r"/*": {"origins": [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # Kept for anyone still running the standalone Milestone-2 frontend
        # (frontend/ + ml-service/ only, without the merged backend/) on its
        # original Vite dev port.
        "http://localhost:5177",
        "http://127.0.0.1:5177",
    ]}},
)


@app.route("/")
def home():
    return jsonify({
        "message": "Medisphere ML API is running"
    })


@app.route("/predict", methods=["POST"])
def predict():
    if predict_patient is None:
        return jsonify({"error": "Prediction is not implemented yet."}), 501

    data = request.get_json(silent=True)
    if not data or not isinstance(data.get("patient_id"), str):
        return jsonify({"error": "Request body must include a 'patient_id' string."}), 400

    try:
        result = predict_patient(data["patient_id"])
        return jsonify(result), 201
    except PredictPatientNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except NoActiveModelError as e:
        return jsonify({"error": str(e)}), 409
    except PredictModelUnavailableError as e:
        return jsonify({"error": str(e)}), 500
    except PredictionError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Unexpected server error while generating the prediction."}), 500


@app.route("/explain/<patient_id>")
def explain(patient_id):
    if explain_patient is None:
        return jsonify({"error": "Explanation is not implemented yet."}), 501

    try:
        result = explain_patient(patient_id)
        return jsonify(result), 200
    except PatientNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except PredictionNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except ModelUnavailableError as e:
        return jsonify({"error": str(e)}), 500
    except ShapExplainError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Unexpected server error while generating the explanation."}), 500


# =========================================================
# MODEL VERSIONING ROUTES
# =========================================================

@app.route("/models", methods=["GET"])
def list_models():
    try:
        models = get_all_models()
        return jsonify(models), 200
    except ModelRegistryError as e:
        return jsonify({"error": str(e)}), 500


@app.route("/models/active", methods=["GET"])
def active_model():
    try:
        model = get_active_model()
        return jsonify(model), 200
    except ModelNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except ModelRegistryError as e:
        return jsonify({"error": str(e)}), 500


@app.route("/models/<int:version_id>", methods=["GET"])
def model_by_id(version_id):
    try:
        model = get_model_by_id(version_id)
        return jsonify(model), 200
    except ModelNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except ModelValidationError as e:
        return jsonify({"error": str(e)}), 400
    except ModelRegistryError as e:
        return jsonify({"error": str(e)}), 500


@app.route("/models", methods=["POST"])
def create_model():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    try:
        model = register_model(data)
        return jsonify(model), 201
    except ModelValidationError as e:
        return jsonify({"error": str(e)}), 400
    except ModelRegistryError as e:
        return jsonify({"error": str(e)}), 500


@app.route("/models/<int:version_id>/activate", methods=["PUT"])
def activate_model_route(version_id):
    try:
        model = activate_model(version_id)
        return jsonify(model), 200
    except ModelNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except ModelValidationError as e:
        return jsonify({"error": str(e)}), 400
    except ModelRegistryError as e:
        return jsonify({"error": str(e)}), 500


@app.route("/models/<int:version_id>/archive", methods=["PUT"])
def archive_model_route(version_id):
    try:
        model = archive_model(version_id)
        return jsonify(model), 200
    except ModelNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except ModelValidationError as e:
        return jsonify({"error": str(e)}), 400
    except ModelRegistryError as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)