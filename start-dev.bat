@echo off
echo Cleaning up port 5173...

REM Find and kill process using port 5173
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo Starting dev server...
npm run dev
