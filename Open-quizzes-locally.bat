@echo off
REM ============================================================
REM  Double-click to open the quiz site in your browser.
REM  This folder must stay the “site root” (contains index.html).
REM  Requires Node.js from https://nodejs.org — first run may
REM  take a moment while npx downloads the small “serve” helper.
REM ============================================================

cd /d "%~dp0"

where npx >nul 2>&1
if errorlevel 1 (
  echo.
  echo Node.js was not found. Install the LTS version from https://nodejs.org
  echo ^(that installs npx^), then double-click this file again.
  echo.
  pause
  exit /b 1
)

echo Starting local server on http://localhost:5173
echo Keep this black window open while you use the quizzes.
echo Close the window when you are finished.
echo.

REM Give Node a few seconds to start ^(longer on first run when packages download^)
start "" cmd /c "timeout /t 8 /nobreak >nul & start http://localhost:5173/"

npx --yes serve -l 5173 .
echo.
pause
