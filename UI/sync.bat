@echo off
cd /d "%~dp0"

echo ========================================
echo   UI Project Sync Tool
echo ========================================
echo.
echo [1] Push to GitHub
echo [2] Pull from GitHub
echo [3] Check status
echo.

choice /c 123 /n /m "Select (1/2/3): "

if errorlevel 3 goto status
if errorlevel 2 goto pull
if errorlevel 1 goto push

:push
echo.
echo Pushing to GitHub...
git add .
git commit -m "update: %date% %time%"
git push
echo.
echo Done!
goto end

:pull
echo.
echo Pulling from GitHub...
git pull
echo.
echo Done!
goto end

:status
echo.
git status
goto end

:end
echo.
pause
