@echo off
echo Starting School ERP...

start "School ERP Server" cmd /k "cd server && npm run dev"
start "School ERP Client" cmd /k "cd client && npm run dev"

echo both servers started!
