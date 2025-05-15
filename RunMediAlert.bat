@echo off
title MediAlert Runner
color 0A
cls

echo Starting MediAlert...
powershell -ExecutionPolicy Bypass -File "%~dp0Start-MediAlert.ps1"

exit 