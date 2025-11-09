# Share2Solve Setup Script
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Share2Solve - MERN Stack Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check MongoDB
Write-Host "Checking MongoDB installation..." -ForegroundColor Yellow
try {
    $mongoVersion = mongod --version | Select-String "db version"
    Write-Host "✓ MongoDB installed: $mongoVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠ MongoDB not found in PATH." -ForegroundColor Yellow
    Write-Host "  You can use MongoDB Atlas (cloud) instead of local installation." -ForegroundColor Yellow
    Write-Host "  See server/MONGODB_SETUP.md for details." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location server
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Setup MongoDB (Local or Atlas) - See server/MONGODB_SETUP.md" -ForegroundColor White
Write-Host "2. Copy .env.example to .env and configure your settings" -ForegroundColor White
Write-Host "3. Copy server/.env.example to server/.env and configure MongoDB connection" -ForegroundColor White
Write-Host "4. MongoDB will create the database automatically when you start" -ForegroundColor White
Write-Host "5. Run 'npm run dev:full' to start the application" -ForegroundColor White
Write-Host ""
