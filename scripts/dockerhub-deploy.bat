@echo off
setlocal enabledelayedexpansion

REM Script para construir y subir imagen a DockerHub en Windows

REM Configuración
if "%DOCKER_USERNAME%"=="" set DOCKER_USERNAME=tu-usuario-dockerhub
set IMAGE_NAME=backend-i
if "%VERSION%"=="" set VERSION=latest
set FULL_IMAGE_NAME=%DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION%

echo 🐳 Script de Despliegue a DockerHub
echo =====================================

REM Función para mostrar ayuda
if "%1"=="help" goto :show_help
if "%1"=="" goto :show_help

REM Función para verificar si Docker está corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está corriendo. Por favor inicia Docker Desktop.
    exit /b 1
)

:show_help
echo Uso: %0 [OPCIÓN]
echo.
echo Opciones:
echo   build     Construir imagen Docker
echo   push      Subir imagen a DockerHub
echo   deploy    Construir y subir imagen (build + push)
echo   login     Hacer login en DockerHub
echo   clean     Limpiar imágenes locales
echo   help      Mostrar esta ayuda
echo.
echo Variables de entorno:
echo   DOCKER_USERNAME    Usuario de DockerHub (default: tu-usuario-dockerhub)
echo   VERSION           Versión de la imagen (default: latest)
echo.
echo Ejemplo:
echo   set DOCKER_USERNAME=mi-usuario && set VERSION=v1.0.0 && %0 deploy
goto :eof

:build_image
echo 📦 Construyendo imagen Docker...
echo Imagen: %FULL_IMAGE_NAME%
docker build -f Dockerfile.final -t %FULL_IMAGE_NAME% .
if errorlevel 1 (
    echo ❌ Error construyendo imagen
    exit /b 1
)
echo ✅ Imagen construida exitosamente
echo 📋 Información de la imagen:
docker images %FULL_IMAGE_NAME%
goto :eof

:push_image
echo 🚀 Subiendo imagen a DockerHub...
echo Imagen: %FULL_IMAGE_NAME%
docker push %FULL_IMAGE_NAME%
if errorlevel 1 (
    echo ❌ Error subiendo imagen
    exit /b 1
)
echo ✅ Imagen subida exitosamente
echo 🔗 Tu imagen está disponible en:
echo    https://hub.docker.com/r/%DOCKER_USERNAME%/%IMAGE_NAME%
echo    docker pull %FULL_IMAGE_NAME%
goto :eof

:dockerhub_login
echo 🔐 Iniciando sesión en DockerHub...
echo Por favor, introduce tus credenciales de DockerHub:
docker login
if errorlevel 1 (
    echo ❌ Error en el login
    exit /b 1
)
echo ✅ Login exitoso
goto :eof

:clean_images
echo 🧹 Limpiando imágenes locales...
docker rmi %FULL_IMAGE_NAME% 2>nul
docker image prune -f
echo ✅ Limpieza completada
goto :eof

:deploy_image
echo 🚀 Iniciando despliegue completo...
call :build_image
if errorlevel 1 exit /b 1
call :dockerhub_login
if errorlevel 1 exit /b 1
call :push_image
if errorlevel 1 exit /b 1
echo 🎉 Despliegue completado exitosamente!
echo 📋 Resumen:
echo    Imagen: %FULL_IMAGE_NAME%
echo    DockerHub: https://hub.docker.com/r/%DOCKER_USERNAME%/%IMAGE_NAME%
echo    Comando pull: docker pull %FULL_IMAGE_NAME%
goto :eof

:generate_docker_readme
echo 📝 Generando información para README...
(
echo # 🐳 Información de Docker
echo.
echo ## Imagen DockerHub
echo.
echo La aplicación está disponible como imagen Docker en DockerHub:
echo.
echo **Imagen:** ``%FULL_IMAGE_NAME%``
echo.
echo **Enlace:** https://hub.docker.com/r/%DOCKER_USERNAME%/%IMAGE_NAME%
echo.
echo ## Uso Rápido
echo.
echo ### Descargar y ejecutar
echo.
echo ```bash
echo # Descargar la imagen
echo docker pull %FULL_IMAGE_NAME%
echo.
echo # Ejecutar la aplicación
echo docker run -p 3000:3000 %FULL_IMAGE_NAME%
echo ```
echo.
echo ### Con Docker Compose
echo.
echo ```bash
echo # Clonar el repositorio
echo git clone ^<tu-repositorio^>
echo cd backend-i
echo.
echo # Ejecutar con Docker Compose
echo docker-compose -f docker-compose.final.yml up -d
echo ```
echo.
echo ## Variables de Entorno
echo.
echo ```bash
echo docker run -p 3000:3000 ^
echo   -e MONGODB_URI=mongodb://localhost:27017/backend ^
echo   -e REDIS_URL=redis://localhost:6379 ^
echo   -e JWT_SECRET=tu-jwt-secret ^
echo   %FULL_IMAGE_NAME%
echo ```
echo.
echo ## Documentación API
echo.
echo Una vez ejecutando, la documentación Swagger estará disponible en:
echo http://localhost:3000/api-docs
echo.
echo ## Versiones Disponibles
echo.
echo - ``latest`` - Última versión estable
echo - ``v1.0.0`` - Versión específica (si aplica)
echo.
echo ## Soporte
echo.
echo Para reportar problemas o solicitar funcionalidades, visita:
echo ^<tu-repositorio-github^>
) > DOCKER_INFO.md
echo ✅ Archivo DOCKER_INFO.md generado
goto :eof

REM Procesar argumentos
if "%1"=="build" (
    call :build_image
) else if "%1"=="push" (
    call :dockerhub_login
    if errorlevel 1 exit /b 1
    call :push_image
) else if "%1"=="deploy" (
    call :deploy_image
    call :generate_docker_readme
) else if "%1"=="login" (
    call :dockerhub_login
) else if "%1"=="clean" (
    call :clean_images
) else (
    call :show_help
)
