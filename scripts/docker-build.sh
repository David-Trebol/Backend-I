#!/bin/bash

# Script para construir y ejecutar la aplicación con Docker

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🐳 Iniciando construcción de Docker...${NC}"

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo. Por favor inicia Docker Desktop.${NC}"
    exit 1
fi

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  build     Construir imagen Docker"
    echo "  run       Ejecutar contenedor"
    echo "  dev       Ejecutar en modo desarrollo"
    echo "  stop      Detener contenedores"
    echo "  clean     Limpiar contenedores e imágenes"
    echo "  logs      Mostrar logs de la aplicación"
    echo "  test      Ejecutar tests en contenedor"
    echo "  help      Mostrar esta ayuda"
}

# Función para construir imagen
build_image() {
    echo -e "${YELLOW}📦 Construyendo imagen Docker...${NC}"
    docker build -t backend-app .
    echo -e "${GREEN}✅ Imagen construida exitosamente${NC}"
}

# Función para ejecutar en producción
run_production() {
    echo -e "${YELLOW}🚀 Ejecutando aplicación en producción...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Aplicación ejecutándose en http://localhost:3000${NC}"
}

# Función para ejecutar en desarrollo
run_development() {
    echo -e "${YELLOW}🔧 Ejecutando aplicación en desarrollo...${NC}"
    docker-compose -f docker-compose.dev.yml up -d
    echo -e "${GREEN}✅ Aplicación en desarrollo ejecutándose en http://localhost:3001${NC}"
}

# Función para detener contenedores
stop_containers() {
    echo -e "${YELLOW}⏹️  Deteniendo contenedores...${NC}"
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    echo -e "${GREEN}✅ Contenedores detenidos${NC}"
}

# Función para limpiar
clean_docker() {
    echo -e "${YELLOW}🧹 Limpiando Docker...${NC}"
    docker-compose down -v --rmi all
    docker-compose -f docker-compose.dev.yml down -v --rmi all
    docker system prune -f
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

# Función para mostrar logs
show_logs() {
    echo -e "${YELLOW}📋 Mostrando logs...${NC}"
    docker-compose logs -f app
}

# Función para ejecutar tests
run_tests() {
    echo -e "${YELLOW}🧪 Ejecutando tests...${NC}"
    docker-compose exec app npm test
}

# Procesar argumentos
case "${1:-help}" in
    "build")
        build_image
        ;;
    "run")
        build_image
        run_production
        ;;
    "dev")
        run_development
        ;;
    "stop")
        stop_containers
        ;;
    "clean")
        clean_docker
        ;;
    "logs")
        show_logs
        ;;
    "test")
        run_tests
        ;;
    "help"|*)
        show_help
        ;;
esac
