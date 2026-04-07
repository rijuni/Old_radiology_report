# =============================================================
# start.ps1 - Quick Start Script for Radiology Backend
# =============================================================
# Use this for daily startup (no rebuilding, just launches).
# Run build.ps1 only when you add new packages or first setup.
#
# HOW TO RUN:
#   cd c:\Users\support\Documents\GitHub\Old_radiology_report\backend
#   .\start.ps1
# =============================================================

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Radiology Report - Backend Startup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# -- Check venv exists --
if (-Not (Test-Path "venv")) {
    Write-Host "ERROR: venv not found. Run build.ps1 first to set up the environment." -ForegroundColor Red
    exit 1
}

# -- Check .env exists --
if (-Not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found. Run build.ps1 first." -ForegroundColor Red
    exit 1
}

# -- Activate virtual environment --
Write-Host "[1/3] Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "  Done." -ForegroundColor Green

# -- Load .env variables --
Write-Host "[2/3] Loading environment variables..." -ForegroundColor Yellow
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]*)=(.*)$") {
        $key   = $matches[1].Trim()
        $value = $matches[2].Trim()
        [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}
$env:DJANGO_SETTINGS_MODULE = "config.settings_prod"
Write-Host "  Done." -ForegroundColor Green

# -- Start Waitress --
Write-Host "[3/3] Starting production server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  URL:      http://0.0.0.0:8000" -ForegroundColor Cyan
Write-Host "  Settings: config.settings_prod" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""

waitress-serve --host=0.0.0.0 --port=8000 config.wsgi:application
