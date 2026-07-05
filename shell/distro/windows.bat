@echo off
cd /d "%~dp0..\.."

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js is required. Install it from https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
)

echo Starting Frozen RPC...
npx electron .
