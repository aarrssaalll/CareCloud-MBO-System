@echo off
echo Starting CareCloud MBO System for Network Access...
echo.
echo Your Network IP: 172.16.14.115
echo Company Access URL: http://172.16.14.115:3000
echo.
echo Setting up network environment...
set HOST=172.16.14.115
set PORT=3000

echo Starting Next.js development server...
npx next dev --hostname 172.16.14.115 --port 3000

pause
