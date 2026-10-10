@echo off
title Harry Potter: Interactive Spell-Casting Game
cd /d "%~dp0"
echo ======================================================================
echo             HARRY POTTER: SPELL-CASTING CHAMBER
echo             Interactive 3D Three.js Web Experience
echo ======================================================================
echo.
echo Opening game in your default web browser...
start "" "http://localhost:8080/index.html"
echo.
echo Local server running at: http://localhost:8080
echo Press Ctrl+C in this window to stop the server when done.
echo.
python -m http.server 8080
if %errorlevel% neq 0 (
    echo Python not found on PATH, attempting npx serve...
    npx -y serve -p 8080 .
)
pause
