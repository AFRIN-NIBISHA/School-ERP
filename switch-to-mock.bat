@echo off
echo Switching to Mock Data mode...
echo.

REM Restore mock version
copy "server\index-mock.js" "server\index.js" /Y

echo.
echo ✅ Switched to Mock Data mode!
echo.
echo No database required - perfect for testing!
echo Restart the server with: npm start
echo.
pause
