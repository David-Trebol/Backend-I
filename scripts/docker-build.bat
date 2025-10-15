@echo off
setlocal enabledelayedexpansion

REM Script para construir y ejecutar la aplicación con Docker en Windows

echo 🐳 Iniciando construcción de Docker...

REM Verificar si Docker está corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está corriendo. Por favor inicia Docker Desktop.
    exit /b 1
)

REM Función para mostrar ayuda
if "%1"=="help" goto :show_help
if "%1"=="" goto :show_help

REM Función para construir imagen
if "%1"=="build" goto :build_image
if "%1"=="run" goto :build_and_run
if "%1"=="dev" goto :run_development
if "%1"=="stop" goto :stop_containers
if "%1"=="clean" goto :clean_docker
if "%1"=="logs" goto :show_logs
if "%1"=="test" goto :run_tests

:show_help
echo Uso: %0 [OPCIÓN]
echo.
echo Opciones:
echo   build     Construir imagen Docker
echo   run       Ejecutar contenedor
echo   dev       Ejecutar en modo desarrollo
echo   stop      Detener contenedores
echo   clean     Limpiar contenedores e imágenes
echo   logs      Mostrar logs de la aplicación
echo   test      Ejecutar tests en contenedor
echo   help      Mostrar esta ayuda
goto :eof

:build_image
echo 📦 Construyendo imagen Docker...
docker build -t backend-app .
if errorlevel 1 (
    echo ❌ Error construyendo imagen
    exit /b 1
)
echo ✅ Imagen construida exitosamente
goto :eof

:build_and_run
call :build_image
if errorlevel 1 exit /b 1
echo 🚀 Ejecutando aplicación en producción...
docker-compose up -d
if errorlevel 1 (
    echo ❌ Error ejecutando aplicación
    exit /b 1
)
echo ✅ Aplicación ejecutándose en http://localhost:3000
goto :eof

:run_development
echo 🔧 Ejecutando aplicación en desarrollo...
docker-compose -f docker-compose.dev.yml up -d
if errorlevel 1 (
    echo ❌ Error ejecutando aplicación en desarrollo
    exit /b 1
)
echo ✅ Aplicación en desarrollo ejecutándose en http://localhost:3001
goto :eof

:stop_containers
echo ⏹️  Deteniendo contenedores...
docker-compose down
docker-compose -f docker-compose.dev.yml down
echo ✅ Contenedores detenidos
goto :eof

:clean_docker
echo 🧹 Limpiando Docker...
docker-compose down -v --rmi all
docker-compose -f docker-compose.dev.yml down -v --rmi all
docker system prune -f
echo ✅ Limpieza completada
goto :eof

:show_logs
echo 📋 Mostrando logs...
docker-compose logs -f app
goto :eof

:run_tests
echo 🧪 Ejecutando tests...
docker-compose exec app npm test
goto :eof
