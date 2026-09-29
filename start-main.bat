@echo off
pushd "%~dp0"
docker compose up -d mongodb kafka
docker compose -f docker-compose.database.yml up -d postgres
start "MediSphere Node Backend" cmd /k "cd /d %~dp0backend && npm install && npm start"
start "MediSphere Team-D Backend" cmd /k "cd /d %~dp0services\Milestone4-Team-Backend && mvn spring-boot:run"
start "MediSphere Frontend" cmd /k "cd /d %~dp0 && npm install && npm run dev"
popd
