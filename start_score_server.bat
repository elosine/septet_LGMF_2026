@echo off
rem Remote audition helper: double-click (e.g. inside a Chrome Remote Desktop
rem session) to start the composer score server on http://localhost:5300
cd /d C:\Users\jwloy\GitHub\septet_2026
echo Score server starting on http://localhost:5300/composer.html
node score\server.js
pause
