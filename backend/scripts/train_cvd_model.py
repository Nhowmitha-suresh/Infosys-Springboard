import os
import json
import math
import random
from datetime import datetime

# Define output path
CONFIG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config")
OUTPUT_FILE = os.path.join(CONFIG_DIR, "cvd_model_params.json")

# Try to use numpy for fast calculations, fallback to vanilla python if not available
try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

print(f"Starting CVD Model Training... Numpy available: {HAS_NUMPY}")

# Features list
FEATURES = ["age", "gender", "systolicBp", "diastolicBp", "cholesterol", "heartRate", "bmi", "diabetes"]

# Standard clinical reference values for normalization
# These will be the baseline mean and standard deviation for normalization
MEANS = {
    "age": 54.0,
    "gender": 0.52, # % Male
    "systolicBp": 128.0,
    "diastolicBp": 81.0,
    "cholesterol": 210.0,
    "heartRate": 74.0,
    "bmi": 26.5,
    "diabetes": 0.15 # % Diabetic
}

STDS = {
    "age": 12.0,
    "gender": 0.5,
    "systolicBp": 17.0,
    "diastolicBp": 10.0,
    "cholesterol": 40.0,
    "heartRate": 12.0,
    "bmi": 5.2,
    "diabetes": 0.35
}

def generate_synthetic_data(num_samples=10000):
    """Generates a realistic clinical dataset for training."""
    random.seed(42)
    data = []
    
    for _ in range(num_samples):
        # Age: 30 - 80
        age = clip(random.normalvariate(54, 12), 30, 80)
        # Gender: Male (1) or Female (0)
        gender = 1 if random.random() < 0.52 else 0
        # Systolic BP: 90 - 190
        systolicBp = clip(random.normalvariate(128, 17), 90, 190)
        # Diastolic BP: 55 - 115
        diastolicBp = clip(random.normalvariate(81, 10), 55, 115)
        # Cholesterol: 100 - 350
        cholesterol = clip(random.normalvariate(210, 40), 100, 350)
        # Heart rate: 45 - 120
        heartRate = clip(random.normalvariate(74, 12), 45, 120)
        # BMI: 15 - 48
        bmi = clip(random.normalvariate(26.5, 5.2), 15, 48)
        # Diabetes: 1 (Diabetic) or 0 (Normal)
        diabetes = 1 if random.random() < 0.15 else 0
        
        # Calculate true log-odds based on clinical factors
        z = -1.8 \
            + 0.65 * ((age - 54.0) / 12.0) \
            + 0.35 * (gender - 0.52) \
            + 0.55 * ((systolicBp - 128.0) / 17.0) \
            + 0.15 * ((diastolicBp - 81.0) / 10.0) \
            + 0.45 * ((cholesterol - 210.0) / 40.0) \
            + 0.10 * ((heartRate - 74.0) / 12.0) \
            + 0.30 * ((bmi - 26.5) / 5.2) \
            + 0.85 * (diabetes - 0.15)
        
        # Add random biological variation/noise
        z += random.normalvariate(0, 0.4)
        
        # Sigmoid probability
        prob = 1.0 / (1.0 + math.exp(-z))
        
        # Determine label (CVD Risk present or not)
        y = 1 if random.random() < prob else 0
        
        data.append({
            "age": age,
            "gender": gender,
            "systolicBp": systolicBp,
            "diastolicBp": diastolicBp,
            "cholesterol": cholesterol,
            "heartRate": heartRate,
            "bmi": bmi,
            "diabetes": diabetes,
            "label": y
        })
        
    return data

def clip(val, min_val, max_val):
    return max(min_val, min(max_val, val))

def train_logistic_regression(data, epochs=1500, lr=0.1):
    """Trains a Logistic Regression model via gradient descent."""
    m = len(data)
    n = len(FEATURES)
    
    # Extract features X (normalized) and labels Y
    X = []
    Y = []
    
    for row in data:
        normalized_row = []
        for feat in FEATURES:
            val = row[feat]
            mean = MEANS[feat]
            std = STDS[feat]
            normalized_row.append((val - mean) / std)
        X.append(normalized_row)
        Y.append(row["label"])
        
    if HAS_NUMPY:
        X = np.array(X)
        Y = np.array(Y).reshape(-1, 1)
        
        # Initialize weights and intercept
        w = np.zeros((n, 1))
        b = 0.0
        
        for epoch in range(epochs):
            # Sigmoid activation
            z = np.dot(X, w) + b
            y_pred = 1.0 / (1.0 + np.exp(-z))
            
            # Gradients
            dw = (1.0 / m) * np.dot(X.T, (y_pred - Y))
            db = (1.0 / m) * np.sum(y_pred - Y)
            
            # Update parameters
            w -= lr * dw
            b -= lr * db
            
            # Print progress
            if epoch % 300 == 0:
                loss = -(1.0 / m) * np.sum(Y * np.log(y_pred + 1e-15) + (1.0 - Y) * np.log(1.0 - y_pred + 1e-15))
                print(f"Epoch {epoch}/{epochs} - Loss: {loss:.5f}")
                
        # Calculate final accuracy
        z = np.dot(X, w) + b
        predictions = (1.0 / (1.0 + np.exp(-z))) >= 0.5
        accuracy = np.mean(predictions == Y)
        
        # Convert weights back to list
        weights_dict = {FEATURES[i]: float(w[i][0]) for i in range(n)}
        intercept = float(b)
        
    else:
        # Vanilla python implementation
        w = [0.0] * n
        b = 0.0
        
        for epoch in range(epochs):
            dw = [0.0] * n
            db = 0.0
            loss = 0.0
            
            for i in range(m):
                # Calculate logit
                z_i = sum(X[i][j] * w[j] for j in range(n)) + b
                y_pred_i = 1.0 / (1.0 + math.exp(-clip(z_i, -20, 20)))
                
                # Gradients accumulator
                error = y_pred_i - Y[i]
                for j in range(n):
                    dw[j] += error * X[i][j]
                db += error
                
                # Loss
                loss += -(Y[i] * math.log(y_pred_i + 1e-15) + (1.0 - Y[i]) * math.log(1.0 - y_pred_i + 1e-15))
                
            # Average gradients
            for j in range(n):
                dw[j] /= m
                w[j] -= lr * dw[j]
            b -= lr * (db / m)
            
            if epoch % 300 == 0:
                print(f"Epoch {epoch}/{epochs} - Loss: {loss / m:.5f}")
                
        # Calculate final accuracy
        correct = 0
        for i in range(m):
            z_i = sum(X[i][j] * w[j] for j in range(n)) + b
            y_pred_i = 1.0 / (1.0 + math.exp(-clip(z_i, -20, 20)))
            pred = 1 if y_pred_i >= 0.5 else 0
            if pred == Y[i]:
                correct += 1
        accuracy = correct / m
        weights_dict = {FEATURES[j]: w[j] for j in range(n)}
        intercept = b
        
    return weights_dict, intercept, accuracy

def main():
    # 1. Ensure config directory exists
    if not os.path.exists(CONFIG_DIR):
        os.makedirs(CONFIG_DIR)
        print(f"Created config directory: {CONFIG_DIR}")
        
    # 2. Generate training data
    print("Generating synthetic data...")
    dataset = generate_synthetic_data(10000)
    base_rate = sum(row["label"] for row in dataset) / len(dataset)
    print(f"Dataset generated. CVD positive base rate: {base_rate * 100:.2f}%")
    
    # 3. Train Model
    print("Training Logistic Regression Model...")
    weights, intercept, accuracy = train_logistic_regression(dataset, epochs=1500, lr=0.1)
    print(f"Training completed. Model accuracy: {accuracy * 100:.2f}%")
    print(f"Intercept: {intercept:.4f}")
    print("Coefficients:")
    for feat, weight in weights.items():
        print(f"  {feat}: {weight:.4f}")
        
    # 4. Save parameters
    params = {
        "version": "2.1",
        "algorithm": "Logistic Regression",
        "trained_at": datetime.now().isoformat(),
        "accuracy": round(accuracy, 4),
        "baseRate": round(base_rate, 4),
        "intercept": round(intercept, 6),
        "coefficients": {k: round(v, 6) for k, v in weights.items()},
        "means": MEANS,
        "stds": STDS
    }
    
    with open(OUTPUT_FILE, "w") as f:
        json.dump(params, f, indent=2)
        
    print(f"Successfully saved model parameters to {OUTPUT_FILE}!")

if __name__ == "__main__":
    main()
