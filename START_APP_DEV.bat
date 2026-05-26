@echo off
setlocal
title Radiology Report - Dev Startup
cd /d "%~dp0"

set BACKEND_PORT=8000
set FRONTEND_PORT=5173
set ES_PORT=9200
set ES_BIN=C:\elasticsearch\elasticsearch-9.3.1\bin\elasticsearch.bat
set ES_BIN_FALLBACK=C:\Users\211210\Downloads\elasticsearch-9.4.1-windows-x86_64\elasticsearch-9.4.1\bin\elasticsearch.bat
set ES_BIN_PATH=

if exist "%ES_BIN%" set ES_BIN_PATH=%ES_BIN%
if not "%ES_BIN_PATH%"=="" goto :es_bin_ready
if exist "%ES_BIN_FALLBACK%" set ES_BIN_PATH=%ES_BIN_FALLBACK%

:es_bin_ready

echo =============================================
echo Radiology Report - Dev Startup
echo =============================================

netstat -ano | find ":%BACKEND_PORT% " >nul
if errorlevel 1 (
    echo Starting backend on http://127.0.0.1:%BACKEND_PORT%...
    start "Radiology Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python manage.py runserver 127.0.0.1:%BACKEND_PORT%"
) else (
    echo Backend already running on http://127.0.0.1:%BACKEND_PORT%.
)

netstat -ano | find ":%FRONTEND_PORT% " >nul
if errorlevel 1 (
    echo Starting frontend on http://127.0.0.1:%FRONTEND_PORT%...
    start "Radiology Frontend" cmd /k "cd /d "%~dp0radio-report-app" && npm run dev -- --host 127.0.0.1 --port %FRONTEND_PORT%"
) else (
    echo Frontend already running on http://127.0.0.1:%FRONTEND_PORT%.
)

netstat -ano | find ":%ES_PORT% " >nul
if errorlevel 1 (
    if not "%ES_BIN_PATH%"=="" (
        echo Starting Elasticsearch on http://127.0.0.1:%ES_PORT%...
        start "Elasticsearch" cmd /k "%ES_BIN_PATH%"
    ) else (
        echo Elasticsearch is not installed at the expected locations.
        echo Backend will fall back to database queries if Elasticsearch is required.
    )
) else (
    echo Elasticsearch already running on http://127.0.0.1:%ES_PORT%.
)

echo.
echo Dev startup complete.
exit /b 0
