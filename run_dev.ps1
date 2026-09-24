# JurisPath Development Runner
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "       STARTING JURISPATH LEGAL TECH MVP      " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Start Backend in background
Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath "d:\JurisPath\backend\venv\Scripts\python.exe" -ArgumentList "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000" -WorkingDirectory "d:\JurisPath\backend" -PassThru

# Start Frontend
Write-Host "[2/2] Starting Next.js Frontend on http://localhost:3000..." -ForegroundColor Green
Set-Location "d:\JurisPath\frontend"
npm.cmd run dev
