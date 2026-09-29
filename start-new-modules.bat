@echo off
rem Optional helper: starts the three services behind the Authentication, Model Versioning
rem and Clinical Rule Engine screens. Run start-main.bat (or equivalent) for the main app.
pushd "%~dp0"
docker compose -f docker-compose.database.yml up -d postgres
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=medisphere
set DB_USER=postgres
set DB_PASSWORD=medisphere
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=medisphere
set PGUSER=postgres
set PGPASSWORD=medisphere
start "MediSphere Spring (Auth)" cmd /k "cd /d %~dp0services\Milestone4-Team-Backend && mvn spring-boot:run"
start "MediSphere Monitoring (Rule Engine)" cmd /k "cd /d %~dp0services\monitoring-service && npm install && npm start"
start "MediSphere ML (Model Versioning)" cmd /k "cd /d %~dp0services\ml-service && pip install -r requirements.txt && flask --app app run --port 5001"
popd
