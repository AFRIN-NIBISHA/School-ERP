@echo off
echo Switching to PostgreSQL mode...
echo.

REM Backup current index.js
copy "server\index.js" "server\index-mock.js" /Y

REM Copy PostgreSQL version
copy "server\index-postgresql.js" "server\index.js" /Y

echo.
echo ✅ Switched to PostgreSQL mode!
echo.
echo Make sure:
echo 1. PostgreSQL is installed and running
echo 2. Database 'school_erp' is created
echo 3. .env file has correct database credentials
echo 4. Run: psql -U postgres -d school_erp -f server\database.sql
echo.
echo Then restart the server with: npm start
echo.
pause
