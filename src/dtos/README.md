# Data Transfer Objects (DTOs)

## Descripción

Los DTOs (Data Transfer Objects) se utilizan para transferir datos entre capas de la aplicación sin exponer información sensible del usuario.

## UserDTO

### Propósito
El `UserDTO` se encarga de transformar los datos del usuario para evitar enviar información sensible como contraseñas, tokens internos, o datos privados.

### Métodos Disponibles

#### `fromUser(user)`
Crea un DTO desde un objeto de usuario completo.
```javascript
const userDTO = UserDTO.fromUser(userObject);
```

#### `fromToken(tokenData)`
Crea un DTO desde los datos del token JWT.
```javascript
const userDTO = UserDTO.fromToken(tokenData);
```

#### `toPublic(user)`
Retorna información pública del usuario (sin email).
```javascript
const publicInfo = UserDTO.toPublic(user);
// Resultado: { id, first_name, last_name, age, role, cart, createdAt, updatedAt }
```

#### `toBasic(user)`
Retorna información básica del usuario.
```javascript
const basicInfo = UserDTO.toBasic(user);
// Resultado: { id, first_name, last_name, role }
```

#### `toProfile(user)`
Retorna información completa del perfil (incluye email).
```javascript
const profileInfo = UserDTO.toProfile(user);
// Resultado: { id, first_name, last_name, email, age, role, createdAt }
```

#### `toAuth(user)`
Retorna información para autenticación.
```javascript
const authInfo = UserDTO.toAuth(user);
// Resultado: { id, email, role, first_name, last_name }
```

## Rutas Protegidas

### `/api/auth/current`
- **Método**: GET
- **Autenticación**: Requerida
- **Información**: Usuario completo sin datos sensibles
- **DTO**: `UserDTO.fromUser()`

### `/api/auth/current/profile`
- **Método**: GET
- **Autenticación**: Requerida
- **Información**: Perfil completo del usuario
- **DTO**: `UserDTO.toProfile()`

### `/api/auth/current/basic`
- **Método**: GET
- **Autenticación**: Requerida
- **Información**: Información básica del usuario
- **DTO**: `UserDTO.toBasic()`

### `/api/sessions/current`
- **Método**: GET
- **Autenticación**: Requerida
- **Información**: Usuario autenticado
- **DTO**: `UserDTO.fromUser()`

### `/api/sessions/current/token`
- **Método**: GET
- **Autenticación**: Requerida
- **Información**: Datos del token (sin consultar BD)
- **DTO**: `UserDTO.fromToken()`

## Información Sensible Protegida

### ❌ No se envía:
- `password` - Contraseña hasheada
- `__v` - Versión del documento MongoDB
- Tokens internos
- Datos de configuración privados

### ✅ Se envía:
- `id` - ID del usuario
- `first_name` - Nombre
- `last_name` - Apellido
- `email` - Email (solo en contextos apropiados)
- `age` - Edad
- `role` - Rol del usuario
- `cart` - ID del carrito
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización

## Middleware de Autenticación

### `authenticateToken`
- Verifica el token JWT
- Crea DTO desde token
- No consulta base de datos

### `authenticateAndGetUser`
- Verifica el token JWT
- Consulta usuario completo desde BD
- Crea DTO con información completa
- Agrega usuario al request

## Ejemplo de Uso

```javascript
// En una ruta protegida
router.get('/profile', authenticateAndGetUser, (req, res) => {
    // req.user ya está en formato DTO sin información sensible
    res.json({ user: req.user });
});

// Crear DTO manualmente
const userDTO = UserDTO.toProfile(userObject);
res.json({ user: userDTO });
```

## Beneficios

1. **Seguridad**: Evita exponer información sensible
2. **Consistencia**: Formato uniforme de respuesta
3. **Flexibilidad**: Diferentes niveles de información según contexto
4. **Mantenibilidad**: Centraliza la lógica de transformación
5. **Performance**: Evita enviar datos innecesarios

## Próximos Pasos

1. **ProductDTO**: Para productos sin información interna
2. **CartDTO**: Para carritos con información resumida
3. **OrderDTO**: Para órdenes con información específica
4. **Validation**: Agregar validaciones a los DTOs 