# Modificación de la Ruta /current

## Resumen de Cambios

Se ha implementado un sistema de DTOs (Data Transfer Objects) para proteger la información sensible del usuario en las rutas `/current`.

## Problema Identificado

### ❌ Antes de la modificación:
- La ruta `/current` enviaba toda la información del usuario incluyendo datos sensibles
- No había control sobre qué información se exponía
- Posible fuga de información sensible como contraseñas hasheadas
- Falta de consistencia en las respuestas de la API

### ✅ Después de la modificación:
- Implementación de DTOs para controlar la información enviada
- Protección de datos sensibles
- Respuestas consistentes y estructuradas
- Diferentes niveles de información según el contexto

## Implementación Realizada

### 1. UserDTO (`src/dtos/UserDTO.js`)

Clase que maneja la transformación de datos del usuario:

```javascript
// Diferentes métodos para diferentes contextos
UserDTO.fromUser(user)        // DTO completo desde usuario
UserDTO.fromToken(tokenData)  // DTO desde token JWT
UserDTO.toPublic(user)        // Información pública (sin email)
UserDTO.toBasic(user)         // Información básica
UserDTO.toProfile(user)       // Perfil completo
UserDTO.toAuth(user)          // Información de autenticación
```

### 2. Middleware de Autenticación (`src/middleware/auth.middleware.js`)

```javascript
// Middleware que usa DTOs
authenticateToken()           // Verifica token y crea DTO
authenticateAndGetUser()      // Obtiene usuario completo y crea DTO
requireRole(roles)            // Verifica roles específicos
```

### 3. Rutas Modificadas

#### `/api/auth/current`
- **Antes**: Enviaba información completa del usuario
- **Ahora**: Usa `authenticateAndGetUser` middleware
- **DTO**: `UserDTO.fromUser()` - Sin información sensible

#### `/api/auth/current/profile`
- **Nueva ruta**: Perfil completo del usuario
- **DTO**: `UserDTO.toProfile()` - Incluye email para perfil

#### `/api/auth/current/basic`
- **Nueva ruta**: Información básica del usuario
- **DTO**: `UserDTO.toBasic()` - Solo información esencial

#### `/api/sessions/current`
- **Modificada**: Usa middleware con DTO
- **DTO**: `UserDTO.fromUser()` - Sin información sensible

#### `/api/sessions/current/token`
- **Nueva ruta**: Información del token sin consultar BD
- **DTO**: `UserDTO.fromToken()` - Solo datos del token

## Información Protegida

### ❌ No se envía más:
- `password` - Contraseña hasheada
- `__v` - Versión del documento MongoDB
- Tokens internos
- Datos de configuración privados
- Información de sistema

### ✅ Se envía de forma controlada:
- `id` - ID del usuario
- `first_name` - Nombre
- `last_name` - Apellido
- `email` - Email (solo en contextos apropiados)
- `age` - Edad
- `role` - Rol del usuario
- `cart` - ID del carrito
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización

## Ejemplos de Respuesta

### Antes:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "password": "$2b$10$hashedpassword...",
    "age": 25,
    "role": "user",
    "__v": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Ahora:
```json
{
  "message": "Usuario autenticado",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "age": 25,
    "role": "user",
    "cart": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Nuevas Rutas Disponibles

### Autenticación
```
GET /api/auth/current          # Usuario autenticado
GET /api/auth/current/profile  # Perfil completo
GET /api/auth/current/basic    # Información básica
```

### Sesiones
```
GET /api/sessions/current      # Sesión activa
GET /api/sessions/current/token # Datos del token
```

## Beneficios Obtenidos

### 1. Seguridad
- ✅ Eliminación de información sensible
- ✅ Control granular sobre datos expuestos
- ✅ Prevención de fuga de datos

### 2. Consistencia
- ✅ Formato uniforme de respuesta
- ✅ Estructura predecible
- ✅ Mensajes descriptivos

### 3. Flexibilidad
- ✅ Diferentes niveles de información
- ✅ Contexto específico para cada ruta
- ✅ Fácil extensión

### 4. Mantenibilidad
- ✅ Lógica centralizada en DTOs
- ✅ Fácil modificación de respuestas
- ✅ Código reutilizable

### 5. Performance
- ✅ Menos datos transferidos
- ✅ Respuestas optimizadas
- ✅ Reducción de ancho de banda

## Compatibilidad

- ✅ Todas las rutas existentes siguen funcionando
- ✅ Interfaz de respuesta mejorada
- ✅ Nuevas rutas opcionales
- ✅ Migración transparente

## Próximos Pasos

1. **ProductDTO**: Para productos sin información interna
2. **CartDTO**: Para carritos con información resumida
3. **Validation**: Agregar validaciones a los DTOs
4. **Caching**: Implementar cache para DTOs
5. **Testing**: Tests unitarios para DTOs

## Conclusión

La implementación de DTOs en las rutas `/current` ha mejorado significativamente la seguridad y estructura de la API:

- **Protección de datos sensibles** mediante DTOs
- **Respuestas consistentes** y estructuradas
- **Flexibilidad** para diferentes contextos
- **Mantenibilidad** mejorada
- **Base sólida** para futuras mejoras

El sistema ahora garantiza que solo la información necesaria y no sensible sea enviada al cliente, manteniendo la funcionalidad existente mientras mejora la seguridad. 