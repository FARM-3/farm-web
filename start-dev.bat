@echo off
echo Checking for existing dev server on port 5173...

:: Find and kill any process using port 5173
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo Stopping existing server PID: %%a
    taskkill /PID %%a /F
)

:: Wait for port to be released
timeout /t 2 /nobreak

echo Starting development server...
npm run dev
