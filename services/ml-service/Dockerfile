# Runtime image for the Medisphere ML microservice (Model Versioning,
# Prediction, SHAP Explainability). Talks to the same PostgreSQL
# instance as backend/, via the DB_* env vars (see .env.example).
FROM python:3.11-slim

WORKDIR /app

# System deps needed to build psycopg2 / scikit-learn / shap wheels on slim images.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000
ENV FLASK_APP=app.py

CMD ["python", "app.py"]
