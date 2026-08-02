@echo off
REM ============================================
REM MODO LOCAL - Para desarrollo normal (sin pagos)
REM ============================================

echo Cambiando a configuracion local...
copy /Y .env.local .env

echo Limpiando cache de configuracion...
php artisan config:clear
php artisan cache:clear

echo.
echo Abriendo Laravel y Vite en ventanas separadas...
echo.

start "LARAVEL SERVER" cmd /k php artisan serve
start "VITE DEV" cmd /k npm run dev

echo.
echo Todo listo. Entra al navegador con:
echo http://127.0.0.1:8000
echo.
pause
