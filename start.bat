@echo off
title NEXUS OMS Server
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   NEXUS OMS · Server-Starter             ║
echo  ║   Automatischer Neustart bei Absturz      ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Alte Node-Instanzen auf Port 5100 beenden
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5100 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 1 /nobreak >nul

:: Browser öffnen (einmalig)
start http://localhost:5100

:: Server-Loop: startet automatisch neu wenn er abstürzt
:loop
echo  [%TIME%] Server wird gestartet ...
npm run dev
echo.
echo  [%TIME%] Server gestoppt oder abgestürzt. Neustart in 3 Sekunden ...
timeout /t 3 /nobreak >nul
goto loop
