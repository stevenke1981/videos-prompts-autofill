@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: Switch to script directory (Support chinese path)
cd /d "%~dp0"

title Prompt Autofill Launcher

echo ==========================================
echo    Prompt Autofill v1.0.0
echo ==========================================
echo.

:: 1. Check Node.js
echo [Step 1/4] Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not installed!
    echo Please download and install from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Detect npm command
set NPM_CMD=npm
where npm.cmd >nul 2>nul
if %errorlevel% equ 0 (
    set NPM_CMD=npm.cmd
)

:: 2. Check node_modules
echo [Step 2/4] Checking dependencies...
set MISSING_DEPS=0
if not exist "node_modules" set MISSING_DEPS=1
if exist "node_modules" (
    if not exist "node_modules\vite\bin\vite.js" set MISSING_DEPS=1
)

if %MISSING_DEPS%==1 (
    echo.
    echo [INFO] Dependencies are missing or incomplete.
    echo [INFO] Installing dependencies...
    echo.
    call %NPM_CMD% install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Installation failed.
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed.
) else (
    echo [INFO] Dependencies found.
)

:: 3. Free port 1420 if a stale dev server is still running
echo [Step 3/4] Checking port 1420...
set PORT_FREED=0
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":1420" ^| findstr "LISTENING"') do (
    if not "%%P"=="0" (
        echo [INFO] Port 1420 is in use by PID %%P — stopping old server...
        taskkill /PID %%P /F >nul 2>nul
        set PORT_FREED=1
    )
)
if !PORT_FREED!==1 (
    echo [INFO] Waiting for port to be released...
    timeout /t 2 /nobreak >nul
)

:: 4. Start Server
echo [Step 4/4] Starting server...
echo.
echo [INFO] The browser should open automatically.
echo [INFO] If not, please open: http://localhost:1420
echo.
echo -------------------------------------------------------
echo.

node node_modules\vite\bin\vite.js --host --open

echo.
echo -------------------------------------------------------
echo [INFO] Server stopped.
pause