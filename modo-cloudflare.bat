@echo off
setlocal enabledelayedexpansion

echo ============================================
echo MODO CLOUDFLARE - Para probar pagos
echo ============================================

REM 1. Partimos de la config local como base
copy /Y .env.local .env >nul

REM 2. Iniciamos el tunel de Cloudflare en segundo plano, guardando su salida en un log
if exist cloudflared_log.txt del cloudflared_log.txt
start /min cmd /c "cloudflared tunnel --url http://localhost:8000 > cloudflared_log.txt 2>&1"

echo Esperando a que Cloudflare genere la URL...
timeout /t 8 /nobreak >nul

REM 3. Extraemos la URL del log usando PowerShell (regex)
set TUNNEL_URL=
for /f "delims=" %%i in ('powershell -NoProfile -Command "try { (Select-String -Path cloudflared_log.txt -Pattern 'https://[a-zA-Z0-9\-]+\.trycloudflare\.com').Matches[0].Value } catch { '' }"') do set TUNNEL_URL=%%i

if "%TUNNEL_URL%"=="" (
    echo No se pudo detectar la URL todavia. Esperando 5 segundos mas...
    timeout /t 5 /nobreak >nul
    for /f "delims=" %%i in ('powershell -NoProfile -Command "try { (Select-String -Path cloudflared_log.txt -Pattern 'https://[a-zA-Z0-9\-]+\.trycloudflare\.com').Matches[0].Value } catch { '' }"') do set TUNNEL_URL=%%i
)

if "%TUNNEL_URL%"=="" (
    echo ERROR: No se pudo detectar la URL de Cloudflare.
    echo Revisa el archivo cloudflared_log.txt manualmente.
    pause
    exit /b 1
)

echo URL detectada: %TUNNEL_URL%

REM 4. Extraemos solo el dominio (sin https://) para SESSION_DOMAIN y SANCTUM
set TUNNEL_DOMAIN=%TUNNEL_URL:https://=%

REM 5. Actualizamos el .env con la URL real usando PowerShell
powershell -NoProfile -Command ^
    "(Get-Content .env) | ForEach-Object { $_ -replace '^APP_URL=.*', 'APP_URL=%TUNNEL_URL%' -replace '^SESSION_DOMAIN=.*', 'SESSION_DOMAIN=%TUNNEL_DOMAIN%' -replace '^SANCTUM_STATEFUL_DOMAINS=.*', 'SANCTUM_STATEFUL_DOMAINS=%TUNNEL_DOMAIN%' } | Set-Content .env"

echo .env actualizado correctamente.

REM 6. Limpiamos cache de configuracion
php artisan config:clear
php artisan cache:clear

REM 7. Compilamos los assets de React una sola vez (evita mixed content del servidor Vite dev)
echo Compilando assets con Vite (npm run build)...
call npm run build

REM 8. Levantamos solo Laravel (los assets ya estan compilados y se sirven desde el mismo puerto)
start "LARAVEL SERVER" cmd /k php artisan serve

echo.
echo ============================================
echo Todo listo. Entra al navegador con:
echo %TUNNEL_URL%
echo ============================================
echo.
pause
