@echo off
title MediAlert Launcher
color 0B
cls

echo.
echo ================================================
echo           MediAlert Desktop Application
echo                 Launcher Script
echo ================================================
echo.

:: Check for admin privileges
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo NOTICE: Running with standard user privileges
    echo If you encounter permission errors, try running as administrator
    echo.
)

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo Press any key to open the Node.js download page...
    pause >nul
    start https://nodejs.org/en/download/
    exit /b 1
)

:: Check Node.js version
node -v > temp.txt
set /p NODE_VERSION=<temp.txt
del temp.txt
echo Found Node.js %NODE_VERSION%

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo ERROR: npm is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check PowerShell execution policy
echo Checking PowerShell execution policy...
powershell -Command "Get-ExecutionPolicy" > temp.txt
set /p POLICY=<temp.txt
del temp.txt

if "%POLICY%"=="Restricted" (
    echo WARNING: PowerShell execution policy is Restricted.
    echo This may cause problems with npm scripts.
    echo.
    echo Would you like to temporarily set the execution policy to RemoteSigned for this session?
    echo This will allow the application to run correctly.
    choice /C YN /M "Change execution policy temporarily (Y/N)? "
    if %ERRORLEVEL%==1 (
        echo Setting temporary execution policy...
        powershell -Command "Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned" >nul 2>&1
        echo Execution policy changed temporarily for this session.
    ) else (
        echo Continuing with current execution policy. Some features may not work correctly.
    )
)

echo Checking dependencies...
if not exist node_modules (
    echo Installing dependencies (this may take a few minutes)...
    echo.
    npm install
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo Failed to install dependencies.
        echo.
        echo Troubleshooting options:
        echo 1. Try running as administrator
        echo 2. Check your internet connection
        echo 3. Try clearing npm cache with: npm cache clean --force
        echo.
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)

echo.
echo Starting MediAlert...
echo.
echo The application window should open momentarily...
echo (If it doesn't appear, check the console for any error messages)

:: Run the application
npm start

:: If npm start fails, provide troubleshooting options
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo Failed to start the application.
    echo.
    echo Troubleshooting suggestions:
    echo 1. Try reinstalling the dependencies with: npm clean-install
    echo 2. Check if Electron is installed with: npm list electron
    echo 3. Try running as administrator
    echo.
    choice /C TR /M "Press T to troubleshoot (reinstall dependencies) or R to exit: "
    if %ERRORLEVEL%==1 (
        echo Reinstalling dependencies...
        rmdir /S /Q node_modules
        npm cache clean --force
        npm install
        echo.
        echo Dependencies reinstalled. Please try running the application again.
    )
)

echo.
echo Press any key to exit...
pause >nul 