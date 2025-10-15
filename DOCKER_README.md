# 🐳 Guía de Dockerización

Este documento explica cómo ejecutar el proyecto usando Docker y Docker Compose.

## 📋 Requisitos Previos

- Docker Desktop instalado y funcionando
- Docker Compose v3.8 o superior
- Al menos 4GB de RAM disponible
- Puerto 3000 y 27017 disponibles

## 🚀 Inicio Rápido

### Opción 1: Usando Scripts (Recomendado)

#### En Windows:
```bash
# Construir y ejecutar en producción
scripts\docker-build.bat run

# Ejecutar en modo desarrollo
scripts\docker-build.bat dev

# Detener contenedores
scripts\docker-build.bat stop
```

#### En Linux/Mac:
```bash
# Construir y ejecutar en producción
./scripts/docker-build.sh run

# Ejecutar en modo desarrollo
./scripts/docker-build.sh dev

# Detener contenedores
./scripts/docker-build.sh stop
```

### Opción 2: Comandos Docker Directos

#### Producción:
```bash
# Construir imagen
docker build -t backend-app .

# Ejecutar con docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f app
```

#### Desarrollo:
```bash
# Ejecutar en modo desarrollo
docker-compose -f docker-compose.dev.yml up -d
```

## 📁 Estructura de Archivos Docker

```
├── Dockerfile                 # Imagen de producción
├── Dockerfile.dev            # Imagen de desarrollo
├── docker-compose.yml        # Configuración de producción
├── docker-compose.dev.yml    # Configuración de desarrollo
├── nginx.conf               # Configuración de Nginx
├── .dockerignore            # Archivos a ignorar en Docker
└── scripts/
    ├── docker-build.sh      # Script para Linux/Mac
    └── docker-build.bat     # Script para Windows
```

## 🔧 Configuración

### Variables de Entorno

Las siguientes variables de entorno se configuran automáticamente:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/backend_db?authSource=admin
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Puertos

- **3000**: Aplicación principal
- **27017**: MongoDB
- **6379**: Redis
- **80**: Nginx (solo en producción)

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Ver contenedores en ejecución
docker-compose ps

# Reiniciar aplicación
docker-compose restart app

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

### Logs y Debugging

```bash
# Ver logs de la aplicación
docker-compose logs -f app

# Ver logs de MongoDB
docker-compose logs -f mongodb

# Ver logs de Redis
docker-compose logs -f redis

# Entrar al contenedor de la aplicación
docker-compose exec app sh
```

### Base de Datos

```bash
# Conectar a MongoDB
docker-compose exec mongodb mongosh -u admin -p password123

# Hacer backup de la base de datos
docker-compose exec mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/backend_db?authSource=admin" --out=/backup

# Restaurar base de datos
docker-compose exec mongodb mongorestore --uri="mongodb://admin:password123@localhost:27017/backend_db?authSource=admin" /backup/backend_db
```

### Testing

```bash
# Ejecutar tests
docker-compose exec app npm test

# Ejecutar tests con coverage
docker-compose exec app npm run test:coverage

# Ejecutar tests en modo watch
docker-compose exec app npm run test:watch
```

## 🔍 Monitoreo y Salud

### Health Checks

Todos los servicios incluyen health checks:

```bash
# Verificar estado de salud
docker-compose ps

# Verificar logs de health check
docker-compose logs app | grep health
```

### Métricas

- **Aplicación**: http://localhost:3000/health
- **API Health**: http://localhost:3000/api/health
- **Estadísticas**: http://localhost:3000/api/stats (requiere autenticación)

## 🚨 Solución de Problemas

### Problemas Comunes

1. **Puerto ya en uso**:
   ```bash
   # Cambiar puertos en docker-compose.yml
   ports:
     - "3001:3000"  # Cambiar 3000 por 3001
   ```

2. **Error de permisos**:
   ```bash
   # En Linux/Mac, cambiar permisos
   chmod +x scripts/docker-build.sh
   ```

3. **Contenedor no inicia**:
   ```bash
   # Ver logs detallados
   docker-compose logs app
   
   # Reconstruir imagen
   docker-compose build --no-cache app
   ```

4. **Base de datos no conecta**:
   ```bash
   # Verificar que MongoDB esté corriendo
   docker-compose ps mongodb
   
   # Reiniciar MongoDB
   docker-compose restart mongodb
   ```

### Limpieza

```bash
# Limpiar todo (¡CUIDADO! Elimina datos)
docker-compose down -v --rmi all
docker system prune -f

# Limpiar solo imágenes no utilizadas
docker image prune -f
```

## 📊 Producción

### Configuración para Producción

1. **Cambiar variables de entorno**:
   ```env
   NODE_ENV=production
   JWT_SECRET=your-super-secure-jwt-secret
   MONGODB_URI=mongodb://your-production-mongo-url
   ```

2. **Configurar SSL**:
   - Descomentar sección HTTPS en `nginx.conf`
   - Agregar certificados SSL en `./ssl/`

3. **Usar Nginx**:
   ```bash
   docker-compose --profile production up -d
   ```

### Optimizaciones

- Usar multi-stage builds para imágenes más pequeñas
- Configurar Redis para persistencia
- Implementar backup automático de MongoDB
- Configurar log rotation
- Usar secrets de Docker para datos sensibles

## 🔐 Seguridad

### Buenas Prácticas

1. **No usar contraseñas por defecto en producción**
2. **Configurar firewall para puertos expuestos**
3. **Usar HTTPS en producción**
4. **Implementar rate limiting**
5. **Mantener imágenes actualizadas**

### Secrets

```bash
# Crear secrets
echo "your-secret-password" | docker secret create db_password -
echo "your-jwt-secret" | docker secret create jwt_secret -
```

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
