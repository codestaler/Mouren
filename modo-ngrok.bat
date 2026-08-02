@echo off
REM ============================================
REM MODO NGROK - Para probar pagos de Mercado Pago
REM ============================================

echo Cambiando a configuracion ngrok...
copy /Y .env.ngrok .env

echo Limpiando cache de configuracion...
php artisan config:clear
php artisan cache:clear

echo.
echo Abriendo ngrok, Laravel y Vite en ventanas separadas...
echo.

start "NGROK TUNNEL" cmd /k ngrok http --url=attendee-circle-hatchery.ngrok-free.dev 8000
start "LARAVEL SERVER" cmd /k php artisan serve
start "VITE DEV" cmd /k set VITE_HMR_HOST=attendee-circle-hatchery.ngrok-free.dev ^&^& npm run dev

echo.
echo Todo listo. Entra al navegador con:
echo https://attendee-circle-hatchery.ngrok-free.dev
echo.
pause
