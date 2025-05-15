@echo on
title MediAlert Debug Launcher
color 0A
cls

:: Set up logging
set LOGFILE=medialert-debug.log
echo Starting MediAlert Debug Session > %LOGFILE%
echo Timestamp: %date% %time% >> %LOGFILE%

echo Checking Node.js installation...
node -v >> %LOGFILE% 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js. >> %LOGFILE%
    echo ERROR: Node.js not found. Please install Node.js.
    pause
    exit /b 1
)

echo Checking npm installation...
npm -v >> %LOGFILE% 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm not found. Please install Node.js. >> %LOGFILE%
    echo ERROR: npm not found. Please install Node.js.
    pause
    exit /b 1
)

echo Checking for node_modules folder...
if not exist node_modules (
    echo node_modules not found, installing dependencies... >> %LOGFILE%
    echo node_modules not found, installing dependencies...
    npm install >> %LOGFILE% 2>&1
) else (
    echo node_modules folder exists >> %LOGFILE%
    echo node_modules folder exists
)

echo Starting Electron application...
echo Starting Electron application... >> %LOGFILE%
echo Command: npm start >> %LOGFILE%

:: Try running npm start with output to both console and log
npm start >> %LOGFILE% 2>&1

:: Check if npm start succeeded
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to start application, error code: %ERRORLEVEL% >> %LOGFILE%
    echo ERROR: Failed to start application, error code: %ERRORLEVEL%
    
    echo Trying direct electron command... >> %LOGFILE%
    echo Trying direct electron command...
    
    :: Try running electron directly
    npx electron . >> %LOGFILE% 2>&1
    
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Direct electron command failed too, error code: %ERRORLEVEL% >> %LOGFILE%
        echo ERROR: Direct electron command failed too, error code: %ERRORLEVEL%
    )
)

echo Debug session complete. See %LOGFILE% for details.
pause 