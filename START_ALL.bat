@echo off
title Radiology Report - Full Application
echo.
echo  ==============================================
echo   Radiology Report - Starting All Servers
echo  ==============================================
echo.

echo  Select Mode:
echo  [1] Development (python manage.py runserver ^& npm run dev)
echo  [2] Production  (waitress ^& npm run preview)
echo.
choice /C 12 /M "Choose an option: "
if errorlevel 2 goto prod
if errorlevel 1 goto dev

:dev
set MODE=DEV
echo.
echo  Starting in DEVELOPMENT mode...
goto start_es

:prod
set MODE=PROD
echo.
echo  Starting in PRODUCTION mode...
goto start_es

:start_es
:: -- Start Elasticsearch --
echo.
echo  [1/3] Starting Elasticsearch (port 9200)...
netstat -ano | find ":9200 " >nul
if %errorlevel% equ 0 (
    echo  Elasticsearch is ALREADY RUNNING in the background. Skipping startup.
) else (
    if exist "C:\elasticsearch\elasticsearch-9.3.1\bin\elasticsearch.bat" (
        start "Elasticsearch" cmd /k "C:\elasticsearch\elasticsearch-9.3.1\bin\elasticsearch.bat"
        echo  Elasticsearch started.
    ) else (
        echo  WARNING: Elasticsearch not found at C:\elasticsearch\elasticsearch-9.3.1\bin\
        echo  Skipping Elasticsearch...
    )
)

:: Wait for Elasticsearch to initialize
echo  Waiting for Elasticsearch to initialize (15 seconds)...
timeout /t 15 /nobreak >nul

:: -- Start Backend --
if "%MODE%"=="PROD" (
    echo  [2/3] Starting Backend PROD (port 8000)...
    start "Radiology Backend" cmd /k "cd /d "%~dp0backend" && START_BACKEND.bat"
) else (
    echo  [2/3] Starting Backend DEV (port 8000)...
    start "Radiology Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python manage.py runserver"
)
echo  Backend started.

:: Wait a moment for backend to initialize
timeout /t 5 /nobreak >nul

:: -- Start Frontend --
if "%MODE%"=="PROD" (
    echo  [3/3] Starting Frontend PROD (port 5173)...
    start "Radiology Frontend" cmd /k "cd /d "%~dp0" && START_FRONTEND.bat"
) else (
    echo  [3/3] Starting Frontend DEV (port 5173)...
    start "Radiology Frontend" cmd /k "cd /d "%~dp0radio-report-app" && npm run dev"
)
echo  Frontend started.

:: Wait then open browser
echo.
echo  All servers are starting in separate windows...
timeout /t 5 /nobreak >nul

echo.
echo  ================================================
echo   Elasticsearch : http://localhost:9200
echo   Backend       : http://localhost:8000
echo   Frontend      : http://localhost:5173
echo  ================================================
echo.

start http://localhost:5173
