@echo off
title Radiology Report - Full Application
echo.
echo  ==============================================
echo   Radiology Report - Starting All Servers
echo  ==============================================
echo.

:: -- Start Elasticsearch --
echo  [1/3] Starting Elasticsearch (port 9200)...
if exist "C:\elasticsearch\elasticsearch-9.3.1\bin\elasticsearch.bat" (
    start "Elasticsearch" cmd /k "C:\elasticsearch\elasticsearch-9.3.1\bin\elasticsearch.bat"
    echo  Elasticsearch started.
) else (
    echo  WARNING: Elasticsearch not found at C:\elasticsearch\elasticsearch-9.3.1\bin\
    echo  Skipping Elasticsearch...
)

:: Wait for Elasticsearch to initialize
echo  Waiting for Elasticsearch to initialize (15 seconds)...
timeout /t 15 /nobreak >nul

:: -- Start Backend --
echo  [2/3] Starting Backend (port 8000)...
start "Radiology Backend" cmd /k "cd /d "%~dp0backend" && START_BACKEND.bat"
echo  Backend started.

:: Wait a moment for backend to initialize
timeout /t 5 /nobreak >nul

:: -- Start Frontend --
echo  [3/3] Starting Frontend (port 5173)...
start "Radiology Frontend" cmd /k "cd /d "%~dp0" && START_FRONTEND.bat"
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
