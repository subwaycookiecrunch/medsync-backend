@echo off
setlocal

:: Change to the directory where this batch file is located
cd /d "%~dp0"

:: Run the main batch file
call run.bat

:: Exit without showing "Press any key to continue"
endlocal
exit /b 