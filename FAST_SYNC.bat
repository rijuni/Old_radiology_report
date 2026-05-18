@echo off
title Radiology Report - Fast Elasticsearch Sync
echo.
echo ==========================================================
echo  Fast Elasticsearch Sync (767,000+ records)
echo ==========================================================
echo.
cd /d "%~dp0backend"
if not exist "venv\" (
    echo ERROR: venv not found! Make sure you are in the project folder.
    pause
    exit /b 1
)
call venv\Scripts\activate.bat
echo.
echo [1/2] Rebuilding index schema in Elasticsearch...
python manage.py search_index --rebuild -f
echo.
echo [2/2] Performing fast, multi-threaded parallel indexing...
echo Chunk size: 5000 | Parallel workers: Auto
python manage.py search_index --populate -f --chunk-size 5000 --parallel
echo.
echo ==========================================================
echo  Sync completed successfully!
echo ==========================================================
echo.
pause
