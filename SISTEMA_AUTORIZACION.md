# Sistema de Autorización

## Descripción

Se ha implementado un sistema completo de autorización que trabaja junto con la estrategia "current" para limitar el acceso a ciertos endpoints según el rol del usuario. El sistema incluye middleware de autorización, auditoría y logging detallado.

## Características Implementadas

### ✅ **Autorización por Roles**

#### **Administradores (admin)**
- ✅ Crear, actualizar y eliminar productos
- ✅ Ver todos los carritos del sistema
- ✅ Acceder a cualquier carrito
- ✅ Gestionar usuarios
- ✅ Ver estadísticas y logs de auditoría

#### **Usuarios (user)**
- ✅ Ver productos (lectura pública)
- ✅ Agregar productos a su propio carrito
- ✅ Remover productos de su propio carrito
- ✅ Actualizar cantidades en su carrito
- ✅ Ver su propio carrito

### ✅ **Seguridad Implementada**

1. **Verificación de Propiedad de Recursos**
   - Usuarios solo pueden acceder a su propio carrito
   - Usuarios solo pueden modificar su propio perfil
   - Administradores pueden acceder a cualquier recurso

2. **Middleware de Autorización**
   - Autenticación automática con JWT
   - Verificación de roles específicos
   - Logging de todas las operaciones

3. **Auditoría Completa**
   - Registro de todas las operaciones
   - Logs de intentos de acceso denegado
   - Estadísticas de uso por rol

## Estructura del Sistema

### 1. Middleware de Autorización

#### `src/middleware/authorization.middleware.js`
```javascript
// Middleware para autorizar operaciones de productos
const authorizeProductOperations = (operation) => { /* ... */ };

// Middleware para autorizar operaciones de carrito
const authorizeCartOperations = (operation) => { /* ... */ };

// Middleware para verificar propiedad del recurso
const authorizeResourceOwnership = (resourceType) => { /* ... */ };

// Middleware para logging de autorización
const logAuthorization = (operation, resource) => { /* ... */ };
```

### 2. Middleware de Auditoría

#### `src/middleware/audit.middleware.js`
```javascript
// Middleware para auditoría de operaciones
const auditLog = (operation, resource) => { /* ... */ };

// Middleware para registrar intentos de acceso denegado
const logAccessDenied = (req, res, next) => { /* ... */ };

// Middleware para estadísticas de acceso
const accessStats = () => { /* ... */ };
```

### 3. Rutas Protegidas

#### **Productos (`/api/products`)**
```
GET    /                    - Público (lectura)
GET    /:id                 - Público (lectura)
POST   /                    - Solo ADMIN
PUT    /:id                 - Solo ADMIN
DELETE /:id                 - Solo ADMIN
PATCH  /:id/stock          - Solo ADMIN
GET    /admin/stats         - Solo ADMIN
```

#### **Carritos (`/api/carts`)**
```
GET    /                    - Solo ADMIN
POST   /                    - Usuario autenticado
GET    /:id                 - Propietario o ADMIN
GET    /:id/detail          - Propietario o ADMIN
POST   /:id/product/:pid    - Propietario o ADMIN
DELETE /:id/product/:pid    - Propietario o ADMIN
PUT    /:id/product/:pid    - Propietario o ADMIN
DELETE /:id                 - Propietario o ADMIN
GET    /:id/total           - Propietario o ADMIN
GET    /:id/count           - Propietario o ADMIN
GET    /current             - Usuario autenticado
POST   /current/product/:pid - Usuario autenticado
DELETE /current/product/:pid - Usuario autenticado
```

#### **Estadísticas (`/api/stats`)**
```
GET    /access              - Solo ADMIN
GET    /authorization       - Solo ADMIN
GET    /audit               - Solo ADMIN
GET    /security            - Solo ADMIN
```

## Flujo de Autorización

### 1. Autenticación
```
Request → Verificar JWT → Extraer usuario → Agregar a req.user
```

### 2. Autorización
```
Request → Verificar rol → Verificar permisos → Verificar propiedad → Permitir/Denegar
```

### 3. Auditoría
```
Request → Log operación → Log resultado → Guardar en archivo → Mostrar en consola
```

## Respuestas de Error

### 401 - No Autenticado
```json
{
    "error": "Usuario no autenticado",
    "details": "Debe iniciar sesión para realizar esta operación"
}
```

### 403 - Acceso Denegado
```json
{
    "error": "Acceso denegado",
    "details": "Solo los administradores pueden crear productos",
    "requiredRole": "admin",
    "currentRole": "user"
}
```

### 403 - Propiedad del Recurso
```json
{
    "error": "Acceso denegado",
    "details": "Solo puede acceder a su propio carrito",
    "resourceType": "cart",
    "requestedId": "507f1f77bcf86cd799439011"
}
```

## Logs de Auditoría

### Formato de Log
```json
{
    "timestamp": "2024-01-01T12:00:00.000Z",
    "operation": "create",
    "resource": "product",
    "method": "POST",
    "path": "/api/products",
    "params": {},
    "query": {},
    "body": { "title": "Producto", "price": 100 },
    "user": {
        "id": "user_id",
        "email": "admin@example.com",
        "role": "admin"
    },
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0...",
    "statusCode": 201,
    "duration": "45ms",
    "response": { "message": "Producto creado exitosamente" }
}
```

### Logs de Acceso Denegado
```json
{
    "timestamp": "2024-01-01T12:00:00.000Z",
    "type": "ACCESS_DENIED",
    "method": "POST",
    "path": "/api/products",
    "statusCode": 403,
    "error": "Acceso denegado",
    "details": "Solo los administradores pueden crear productos",
    "user": {
        "id": "user_id",
        "email": "usuario@example.com",
        "role": "user"
    },
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0..."
}
```

## Uso del Sistema

### 1. Proteger Rutas de Productos
```javascript
// Solo admin puede crear productos
router.post('/', authorizeProduct('create'), async (req, res) => {
    // Lógica de creación
});

// Solo admin puede actualizar productos
router.put('/:id', authorizeProduct('update'), async (req, res) => {
    // Lógica de actualización
});

// Solo admin puede eliminar productos
router.delete('/:id', authorizeProduct('delete'), async (req, res) => {
    // Lógica de eliminación
});
```

### 2. Proteger Rutas de Carritos
```javascript
// Usuario autenticado puede agregar productos
router.post('/:cid/product/:pid', authorizeCart('add'), authorizeResourceOwnership('cart'), async (req, res) => {
    // Lógica de agregar producto
});

// Solo admin puede ver todos los carritos
router.get('/', authorizeCart('admin'), async (req, res) => {
    // Lógica de listar carritos
});
```

### 3. Verificar Permisos Específicos
```javascript
// Verificar permiso específico
router.get('/admin/stats', checkPermission('products.read'), async (req, res) => {
    // Lógica de estadísticas
});
```

## Estadísticas Disponibles

### `/api/stats/access`
```json
{
    "message": "Estadísticas de acceso",
    "stats": {
        "totalRequests": 150,
        "successfulRequests": 120,
        "failedRequests": 20,
        "accessDenied": 10,
        "byRole": {
            "admin": 50,
            "user": 70,
            "anonymous": 30
        },
        "byResource": {
            "products": 60,
            "carts": 40,
            "users": 20
        }
    },
    "requestedBy": "admin@example.com"
}
```

### `/api/stats/authorization`
```json
{
    "message": "Estadísticas de autorización",
    "stats": {
        "totalRequests": 150,
        "successfulAuth": 120,
        "failedAuth": 20,
        "accessDenied": 10,
        "byRole": { /* ... */ },
        "byResource": { /* ... */ },
        "permissions": {
            "products.create": { "allowedRoles": ["admin"], "totalAttempts": 15, "successful": 10, "denied": 5 },
            "cart.add": { "allowedRoles": ["user", "admin"], "totalAttempts": 30, "successful": 25, "denied": 5 }
        }
    }
}
```

## Configuración

### Variables de Entorno
```bash
# Configuración de auditoría
AUDIT_LOG_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_LOG_FILE=logs/audit.log

# Configuración de autorización
AUTHORIZATION_STRICT_MODE=true
AUTHORIZATION_LOG_ACCESS_DENIED=true
```

### Archivos de Log
```
src/logs/
├── audit.log          # Logs de auditoría
├── access.log         # Logs de acceso
└── security.log       # Logs de seguridad
```

## Ejemplos de Uso

### 1. Crear Producto (Solo Admin)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nuevo Producto",
    "price": 100,
    "stock": 10
  }'
```

### 2. Agregar Producto al Carrito (Usuario)
```bash
curl -X POST http://localhost:3000/api/carts/current/product/123 \
  -H "Authorization: Bearer user_token" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 2}'
```

### 3. Ver Estadísticas (Solo Admin)
```bash
curl -X GET http://localhost:3000/api/stats/access \
  -H "Authorization: Bearer admin_token"
```

## Beneficios del Sistema

### 🔒 **Seguridad**
- Verificación automática de roles
- Prevención de acceso no autorizado
- Logging de intentos de acceso denegado

### 📊 **Auditoría**
- Registro completo de operaciones
- Estadísticas de uso por rol
- Trazabilidad de acciones

### 🎯 **Flexibilidad**
- Middleware reutilizable
- Configuración por operación
- Fácil extensión de permisos

### 🚀 **Performance**
- Verificación eficiente de permisos
- Logging asíncrono
- Cache de roles y permisos

## Próximos Pasos

1. **Rate Limiting**: Implementar límites por IP y usuario
2. **Permisos Granulares**: Permisos específicos por recurso
3. **Sesiones**: Gestión de sesiones activas
4. **Notificaciones**: Alertas de seguridad
5. **Dashboard**: Interfaz web para administración

## Conclusión

El sistema de autorización implementado proporciona:

- ✅ **Control de acceso granular** por rol y operación
- ✅ **Verificación de propiedad** de recursos
- ✅ **Auditoría completa** de todas las operaciones
- ✅ **Logging detallado** de intentos de acceso
- ✅ **Estadísticas en tiempo real** de uso
- ✅ **Respuestas claras** de errores de autorización

El sistema está listo para producción y cumple con las mejores prácticas de seguridad para control de acceso. 