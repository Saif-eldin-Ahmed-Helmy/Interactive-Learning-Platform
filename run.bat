@echo off
setlocal
cd /d "%~dp0"
echo Starting Interactive Learning Platform...
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-demo.ps1"
if errorlevel 1 (
  echo.
  echo The app could not start. Read the message above, then try again.
  pause
)
