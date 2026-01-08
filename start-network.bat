@echo off
setlocal enabledelayedexpansion

REM Get the local network IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do set IP=%%a
set IP=%IP:~1%

echo.
echo ========================================
echo CareCloud MBO System - Network Server
echo ========================================
echo.
echo Local Network IP: %IP%
echo Port: 3000
echo.
echo Access URLs:
echo   Local Network:  http://%IP%:3000
echo   This Machine:   http://localhost:3000
echo.
echo Server is now PUBLICLY ACCESSIBLE from any device on the network
echo ========================================
echo.

REM Set environment variables for public access
set HOST=0.0.0.0
set PORT=3000

REM Start the server with auto-restart on failure
:start_server
echo [%date% %time%] Starting CareCloud MBO System server...
echo.

REM Start Next.js with public hostname binding
npx next dev --hostname 0.0.0.0 --port 3000

REM If the server exits, restart it after 5 seconds
echo.
echo [%date% %time%] Server stopped. Restarting in 5 seconds...
timeout /t 5 /nobreak
goto start_server

endlocal
pause
