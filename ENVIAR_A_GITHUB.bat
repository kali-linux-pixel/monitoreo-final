@echo off
echo ================================================
echo APLICANDO PARCHE FINAL Y ENVIANDO A GITHUB...
echo ================================================
echo.
git add .
git commit -m "Solucion final: Compatibilidad Express 5"
echo.
echo Enviando a la nube...
git push origin main
echo.
echo ================================================
if %ERRORLEVEL% EQU 0 (
    echo FELICIDADES! TODO ESTA LISTO AHORA.
) else (
    echo Hubo un problema de permisos, intentalo de nuevo.
)
echo ================================================
pause
