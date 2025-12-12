@echo off
echo Starting Farm Management Backend API...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if we're in the backend directory
if not exist "package.json" (
    echo Error: Please run this script from the backend directory
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the backend server
echo Starting Farm Management Backend API server...
echo Server will be available at: http://localhost:8000
echo Health check endpoint: http://localhost:8000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev