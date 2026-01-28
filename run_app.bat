@echo off
echo Starting Financial Tracker App...
start "Backend Server" cmd /k "cd backend && npm run dev"
start "Frontend App" cmd /k "cd frontend && npm run dev"
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
pause
