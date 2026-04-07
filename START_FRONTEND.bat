@echo off
title Radiology Frontend - Production Preview
echo.
echo  ==============================================
echo   Radiology Report - Frontend Starting (PROD)
echo  ==============================================
echo.

cd /d "%~dp0radio-report-app"

if not exist "dist\" (
    echo  ERROR: dist folder not found.
    echo  Running: npm run build...
    call npm run build
)

echo  Starting frontend production preview with API proxy...
echo  URL: http://localhost:5173
echo  Press Ctrl+C to stop.
echo.

npm run preview

pause
