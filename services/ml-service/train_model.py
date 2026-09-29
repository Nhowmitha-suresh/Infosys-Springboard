import os
import joblib
import psycopg2
import pandas as pd

from pathlib import Path
from dotenv import load_dotenv

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)


# =========================================================
# 1. LOAD ENVIRONMENT VARIABLES
# =========================================================

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")


# =========================================================
# 2. CONNECT TO POSTGRESQL
# =========================================================

print("Connecting to PostgreSQL...")

connection = psycopg2.connect(
    host=DB_HOST,
    port=int(DB_PORT),
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD
)

print("✅ PostgreSQL connection successful!")
print()


# =========================================================
# 3. LOAD ML DATASET
# =========================================================

query = """
SELECT
    patient_id,
    age,
    gender,
    heart_rate,
    spo2,
    systolic_bp,
    diastolic_bp,
    temperature,
    bmi,
    glucose,
    cholesterol,
    smoking_status,
    risk_label
FROM ml_patient_data
ORDER BY patient_id;
"""

df = pd.read_sql_query(query, connection)

connection.close()

print("ML dataset loaded successfully!")
print("Records:", len(df))
print()


# =========================================================
# 4. DEFINE FEATURES AND TARGET
# =========================================================

features = [
    "age",
    "gender",
    "heart_rate",
    "spo2",
    "systolic_bp",
    "diastolic_bp",
    "temperature",
    "bmi",
    "glucose",
    "cholesterol",
    "smoking_status"
]

X = df[features]
y = df["risk_label"]


# =========================================================
# 5. DEFINE FEATURE TYPES
# =========================================================

categorical_features = [
    "gender",
    "smoking_status"
]

numerical_features = [
    "age",
    "heart_rate",
    "spo2",
    "systolic_bp",
    "diastolic_bp",
    "temperature",
    "bmi",
    "glucose",
    "cholesterol"
]


# =========================================================
# 6. PREPROCESSING
# =========================================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        ),
        (
            "numerical",
            "passthrough",
            numerical_features
        )
    ]
)


# =========================================================
# 7. TRAIN / TEST SPLIT
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training records:", len(X_train))
print("Testing records:", len(X_test))
print()


# =========================================================
# 8. TRANSFORM DATA
# =========================================================

X_train_transformed = preprocessor.fit_transform(X_train)

X_test_transformed = preprocessor.transform(X_test)


# =========================================================
# 9. TRAIN RANDOM FOREST
# =========================================================

print("Training Random Forest...")

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=5,
    random_state=42
)

model.fit(
    X_train_transformed,
    y_train
)

print("✅ Random Forest trained successfully!")
print()


# =========================================================
# 10. MAKE TEST PREDICTIONS
# =========================================================

y_pred = model.predict(X_test_transformed)


# =========================================================
# 11. CALCULATE MODEL METRICS
# =========================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

precision = precision_score(
    y_test,
    y_pred,
    zero_division=0
)

recall = recall_score(
    y_test,
    y_pred,
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0
)


print("===================================")
print("MODEL v1.0 PERFORMANCE")
print("===================================")

print(f"Accuracy  : {accuracy:.4f}")
print(f"Precision : {precision:.4f}")
print(f"Recall    : {recall:.4f}")
print(f"F1 Score  : {f1:.4f}")

print("===================================")
print()


# =========================================================
# 12. SAVE MODEL
# =========================================================

model_package = {
    "model": model,
    "preprocessor": preprocessor,
    "features": features,
    "categorical_features": categorical_features,
    "numerical_features": numerical_features
}

model_path = "models/patient_risk_v1.pkl"

joblib.dump(
    model_package,
    model_path
)

print("✅ Model saved successfully!")
print("Location:", model_path)
print()


# =========================================================
# 13. STORE MODEL VERSION IN DATABASE
# =========================================================

insert_query = """
INSERT INTO model_versions
(
    model_name,
    version_number,
    algorithm,
    dataset_name,
    accuracy,
    precision_score,
    recall_score,
    f1_score,
    training_date,
    model_path,
    status
)
VALUES
(
    %s,
    %s,
    %s,
    %s,
    %s,
    %s,
    %s,
    %s,
    CURRENT_TIMESTAMP,
    %s,
    %s
)
RETURNING version_id;
"""


connection = psycopg2.connect(
    host=DB_HOST,
    port=int(DB_PORT),
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD
)

cursor = connection.cursor()

cursor.execute(
    insert_query,
    (
        "Patient Risk Prediction",
        "v1.0",
        "Random Forest",
        "ml_patient_data",
        float(accuracy),
        float(precision),
        float(recall),
        float(f1),
        model_path,
        "Active"
    )
)

version_id = cursor.fetchone()[0]

connection.commit()

cursor.close()
connection.close()


# =========================================================
# 14. FINAL RESULT
# =========================================================

print("===================================")
print("MODEL VERSION STORED")
print("===================================")
print("Version ID:", version_id)
print("Version   : v1.0")
print("Algorithm : Random Forest")
print("Status    : Active")
print("===================================")