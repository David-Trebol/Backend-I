#!/bin/bash

# Script para construir y subir imagen a DockerHub
set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
DOCKER_USERNAME=${DOCKER_USERNAME:-"tu-usuario-dockerhub"}
IMAGE_NAME="backend-i"
VERSION=${VERSION:-"latest"}
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"

echo -e "${BLUE}🐳 Script de Despliegue a DockerHub${NC}"
echo -e "${BLUE}=====================================${NC}"

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  build     Construir imagen Docker"
    echo "  push      Subir imagen a DockerHub"
    echo "  deploy    Construir y subir imagen (build + push)"
    echo "  login     Hacer login en DockerHub"
    echo "  clean     Limpiar imágenes locales"
    echo "  help      Mostrar esta ayuda"
    echo ""
    echo "Variables de entorno:"
    echo "  DOCKER_USERNAME    Usuario de DockerHub (default: tu-usuario-dockerhub)"
    echo "  VERSION           Versión de la imagen (default: latest)"
    echo ""
    echo "Ejemplo:"
    echo "  DOCKER_USERNAME=mi-usuario VERSION=v1.0.0 $0 deploy"
}

# Función para verificar si Docker está corriendo
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker no está corriendo. Por favor inicia Docker Desktop.${NC}"
        exit 1
    fi
}

# Función para verificar si el usuario está logueado en DockerHub
check_dockerhub_login() {
    if ! docker info | grep -q "Username:"; then
        echo -e "${YELLOW}⚠️  No estás logueado en DockerHub. Ejecuta: $0 login${NC}"
        return 1
    fi
    return 0
}

# Función para hacer login en DockerHub
dockerhub_login() {
    echo -e "${YELLOW}🔐 Iniciando sesión en DockerHub...${NC}"
    echo "Por favor, introduce tus credenciales de DockerHub:"
    docker login
    echo -e "${GREEN}✅ Login exitoso${NC}"
}

# Función para construir la imagen
build_image() {
    echo -e "${YELLOW}📦 Construyendo imagen Docker...${NC}"
    echo -e "${BLUE}Imagen: ${FULL_IMAGE_NAME}${NC}"
    
    docker build -f Dockerfile.final -t ${FULL_IMAGE_NAME} .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Imagen construida exitosamente${NC}"
        
        # Mostrar información de la imagen
        echo -e "${BLUE}📋 Información de la imagen:${NC}"
        docker images ${FULL_IMAGE_NAME}
    else
        echo -e "${RED}❌ Error construyendo imagen${NC}"
        exit 1
    fi
}

# Función para subir la imagen
push_image() {
    echo -e "${YELLOW}🚀 Subiendo imagen a DockerHub...${NC}"
    echo -e "${BLUE}Imagen: ${FULL_IMAGE_NAME}${NC}"
    
    docker push ${FULL_IMAGE_NAME}
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Imagen subida exitosamente${NC}"
        echo -e "${BLUE}🔗 Tu imagen está disponible en:${NC}"
        echo -e "${BLUE}   https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}${NC}"
        echo -e "${BLUE}   docker pull ${FULL_IMAGE_NAME}${NC}"
    else
        echo -e "${RED}❌ Error subiendo imagen${NC}"
        exit 1
    fi
}

# Función para limpiar imágenes locales
clean_images() {
    echo -e "${YELLOW}🧹 Limpiando imágenes locales...${NC}"
    
    # Eliminar imagen específica
    docker rmi ${FULL_IMAGE_NAME} 2>/dev/null || true
    
    # Limpiar imágenes no utilizadas
    docker image prune -f
    
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

# Función para desplegar (build + push)
deploy_image() {
    echo -e "${BLUE}🚀 Iniciando despliegue completo...${NC}"
    
    check_docker
    
    build_image
    
    if ! check_dockerhub_login; then
        dockerhub_login
    fi
    
    push_image
    
    echo -e "${GREEN}🎉 Despliegue completado exitosamente!${NC}"
    echo -e "${BLUE}📋 Resumen:${NC}"
    echo -e "   Imagen: ${FULL_IMAGE_NAME}"
    echo -e "   DockerHub: https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}"
    echo -e "   Comando pull: docker pull ${FULL_IMAGE_NAME}"
}

# Función para generar README con información de Docker
generate_docker_readme() {
    echo -e "${YELLOW}📝 Generando información para README...${NC}"
    
    cat > DOCKER_INFO.md << EOF
# 🐳 Información de Docker

## Imagen DockerHub

La aplicación está disponible como imagen Docker en DockerHub:

**Imagen:** \`${FULL_IMAGE_NAME}\`

**Enlace:** https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}

## Uso Rápido

### Descargar y ejecutar

\`\`\`bash
# Descargar la imagen
docker pull ${FULL_IMAGE_NAME}

# Ejecutar la aplicación
docker run -p 3000:3000 ${FULL_IMAGE_NAME}
\`\`\`

### Con Docker Compose

\`\`\`bash
# Clonar el repositorio
git clone <tu-repositorio>
cd backend-i

# Ejecutar con Docker Compose
docker-compose -f docker-compose.final.yml up -d
\`\`\`

## Variables de Entorno

\`\`\`bash
docker run -p 3000:3000 \\
  -e MONGODB_URI=mongodb://localhost:27017/backend \\
  -e REDIS_URL=redis://localhost:6379 \\
  -e JWT_SECRET=tu-jwt-secret \\
  ${FULL_IMAGE_NAME}
\`\`\`

## Documentación API

Una vez ejecutando, la documentación Swagger estará disponible en:
http://localhost:3000/api-docs

## Versiones Disponibles

- \`latest\` - Última versión estable
- \`v1.0.0\` - Versión específica (si aplica)

## Soporte

Para reportar problemas o solicitar funcionalidades, visita:
<tu-repositorio-github>
EOF

    echo -e "${GREEN}✅ Archivo DOCKER_INFO.md generado${NC}"
}

# Procesar argumentos
case "${1:-help}" in
    "build")
        check_docker
        build_image
        ;;
    "push")
        check_docker
        if ! check_dockerhub_login; then
            dockerhub_login
        fi
        push_image
        ;;
    "deploy")
        deploy_image
        generate_docker_readme
        ;;
    "login")
        check_docker
        dockerhub_login
        ;;
    "clean")
        clean_images
        ;;
    "help"|*)
        show_help
        ;;
esac
