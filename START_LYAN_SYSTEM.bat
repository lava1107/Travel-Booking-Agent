@echo off
title Travel Agent Management System Launcher
echo ========================================================
echo   Lyan Travels - Travel Agent Management System Launcher
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python Backend (Port 8000)...
netstat -ano | findstr ":8000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo       Python FastAPI is already running on port 8000.
) else (
    echo       Starting Python FastAPI on port 8000...
    start /min "TravelAgent-Backend" cmd /c "cd /d "%~dp0nlp-service" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
)

echo [2/3] Checking Frontend Dev Server (Port 5173)...
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo       Frontend is already running on port 5173.
) else (
    echo       Starting Frontend on port 5173...
    start /min "TravelAgent-Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"
)

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Opening Travel Agent Management System in your browser...
start http://localhost:5173

echo.
echo ========================================================
echo   System is LIVE and Always Working!
echo   - Frontend: http://localhost:5173
echo   - Backend API: http://127.0.0.1:8000
echo   - Swagger API Docs: http://127.0.0.1:8000/docs
echo ========================================================
echo You can minimize this window or close it. The servers will keep running.
timeout /t 5
