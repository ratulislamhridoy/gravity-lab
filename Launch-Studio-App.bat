@echo off
title Launching Gravity AI Studio...

:: Free port 8080 if in use
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { $pid8080 = (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess; if ($pid8080) { Stop-Process -Id $pid8080 -Force } }"

:: Start server.js in background using Antigravity Node container
set ELECTRON_RUN_AS_NODE=1
start "" /B "D:\Install Application\Antigravity\Antigravity.exe" "D:\softower making\Gravity Ai\server.js"

:: Wait 2 seconds for server to start
timeout /t 2 /nobreak >nul

:: Launch Microsoft Edge in App Mode
start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:8080/
exit
