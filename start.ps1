# Quick Start Script for Windows PowerShell

Write-Host "🚀 Starting share2solve Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (!(Test-Path "server\.env")) {
    Write-Host "❌ Error: server\.env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create server\.env file with:" -ForegroundColor Yellow
    Write-Host "  DATABASE_URL=your-postgres-connection-string" -ForegroundColor Gray
    Write-Host "  ADMIN_PASSWORD=your-secure-password" -ForegroundColor Gray
    Write-Host ""
    Write-Host "See server/README.md for setup instructions" -ForegroundColor Yellow
    exit 1
}

# Start backend
Write-Host "Starting backend on http://localhost:4000 ..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd server; npm start"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "✓ Both servers starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "Admin:    http://localhost:5173/?admin=view" -ForegroundColor Cyan
Write-Host ""
