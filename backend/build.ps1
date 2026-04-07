# =============================================================
# build.ps1 - Production Build Script for Radiology Backend
# =============================================================
# HOW TO RUN:
#   Open PowerShell, then:
#   cd c:\Users\support\Documents\GitHub\Old_radiology_report\backend
#   .\build.ps1
# =============================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Radiology Report - Backend Build Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# -- Step 1: Check Python --
Write-Host "[1/6] Checking Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python is not installed or not in PATH." -ForegroundColor Red
    exit 1
}
Write-Host "  Found: $pythonVersion" -ForegroundColor Green

# -- Step 2: Virtual environment --
Write-Host ""
Write-Host "[2/6] Setting up virtual environment..." -ForegroundColor Yellow

if (-Not (Test-Path "venv")) {
    Write-Host "  Creating venv..." -ForegroundColor Gray
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create virtual environment." -ForegroundColor Red
        exit 1
    }
    Write-Host "  venv created." -ForegroundColor Green
} else {
    Write-Host "  venv already exists, skipping." -ForegroundColor Green
}

# Activate venv
& ".\venv\Scripts\Activate.ps1"
Write-Host "  Virtual environment activated." -ForegroundColor Green

# -- Step 3: Install dependencies --
Write-Host ""
Write-Host "[3/6] Installing dependencies from requirements.txt..." -ForegroundColor Yellow
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: pip install failed. Check requirements.txt." -ForegroundColor Red
    exit 1
}
pip install waitress --quiet
Write-Host "  All packages installed." -ForegroundColor Green

# -- Step 4: Check .env file --
Write-Host ""
Write-Host "[4/6] Checking environment configuration..." -ForegroundColor Yellow

if (-Not (Test-Path ".env")) {
    Write-Host "  WARNING: .env file not found!" -ForegroundColor Red
    Write-Host "  Copying .env.example to .env - fill in real values before running." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "  .env created from template. Edit it, then re-run this script." -ForegroundColor Yellow
    Write-Host "  IMPORTANT: Set DJANGO_SECRET_KEY and DB_PASSWORD in backend\.env" -ForegroundColor Magenta
    Pause
}

# Load .env variables into current session
Write-Host "  Loading .env variables..." -ForegroundColor Gray
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]*)=(.*)$") {
        $key   = $matches[1].Trim()
        $value = $matches[2].Trim()
        [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}
Write-Host "  Environment variables loaded." -ForegroundColor Green

# -- Step 5: Django checks --
Write-Host ""
Write-Host "[5/6] Running Django production checks..." -ForegroundColor Yellow

$env:DJANGO_SETTINGS_MODULE = "config.settings_prod"

# Collect static files
Write-Host "  Collecting static files..." -ForegroundColor Gray
python manage.py collectstatic --noinput --settings=config.settings_prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: collectstatic had issues (non-fatal if no static files yet)." -ForegroundColor Yellow
} else {
    Write-Host "  Static files collected." -ForegroundColor Green
}

# Run migrations
Write-Host "  Running database migrations..." -ForegroundColor Gray
python manage.py migrate --settings=config.settings_prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Migration failed. Check database connection and credentials." -ForegroundColor Red
    exit 1
}
Write-Host "  Migrations done." -ForegroundColor Green

# Django system checks
Write-Host "  Running Django system checks..." -ForegroundColor Gray
python manage.py check --deploy --settings=config.settings_prod 2>&1
Write-Host "  System checks complete." -ForegroundColor Green

# -- Step 6: Launch with Waitress --
Write-Host ""
Write-Host "[6/6] Starting production server with Waitress..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Server: http://0.0.0.0:8000" -ForegroundColor Cyan
Write-Host "  Settings: config.settings_prod" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""

$env:DJANGO_SETTINGS_MODULE = "config.settings_prod"
waitress-serve --host=0.0.0.0 --port=8000 config.wsgi:application
