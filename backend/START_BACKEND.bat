@echo off
title Radiology Backend - Production Server
echo.
echo  ======================================
echo   Radiology Report - Backend Starting
echo  ======================================
echo.

cd /d "%~dp0"

if not exist "venv\" (
    echo  ERROR: venv not found. Run build.ps1 first.
    pause
    exit /b 1
)

if not exist ".env" (
    echo  ERROR: .env file not found.
    pause
    exit /b 1
)

:: Load .env variables into this session
echo  Loading environment variables...
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    if not "%%a"=="" (
        set "%%a=%%b"
    )
)

:: Activate virtual environment
echo  Activating virtual environment...
call venv\Scripts\activate.bat

:: Set Django settings
set DJANGO_SETTINGS_MODULE=config.settings_prod

echo  Starting production server...
echo.
echo  URL:      http://localhost:8000
echo  Settings: config.settings_prod
echo  Press Ctrl+C to stop.
echo.

:: Run waitress using the venv python directly (most reliable)
venv\Scripts\python.exe -m waitress --host=0.0.0.0 --port=8000 config.wsgi:application

pause
