# Sistema de Recuperación de Contraseña

## Descripción

Se ha implementado un sistema completo de recuperación de contraseña que permite a los usuarios restablecer su contraseña de forma segura mediante enlaces enviados por correo electrónico.

## Características Implementadas

### ✅ Funcionalidades Principales

1. **Solicitud de Recuperación**
   - Formulario para ingresar email
   - Validación de usuario existente
   - Generación de token único y seguro
   - Envío de correo con enlace de recuperación

2. **Enlaces Seguros**
   - Tokens únicos de 64 caracteres
   - Expiración automática después de 1 hora
   - Verificación de validez antes de permitir restablecimiento

3. **Restablecimiento de Contraseña**
   - Formulario seguro para nueva contraseña
   - Validación de requisitos mínimos
   - Prevención de reutilización de contraseña anterior
   - Confirmación de contraseña

4. **Seguridad Avanzada**
   - Verificación de que la nueva contraseña no sea igual a la anterior
   - Verificación de que no sea igual a la actual
   - Tokens de un solo uso
   - Limpieza automática de tokens expirados

## Estructura del Sistema

### 1. Modelos

#### PasswordResetToken (`src/models/PasswordResetToken.js`)
```javascript
{
    user: ObjectId,           // Referencia al usuario
    token: String,            // Token único de 64 caracteres
    expiresAt: Date,          // Fecha de expiración (1 hora)
    used: Boolean,            // Si el token ya fue usado
    previousPassword: String   // Hash de la contraseña anterior
}
```

### 2. Repositorios

#### PasswordResetTokenRepository (`src/repositories/PasswordResetTokenRepository.js`)
- `findByToken(token)` - Buscar token específico
- `findValidToken(token)` - Verificar token válido
- `createToken(userId, token, previousPassword)` - Crear nuevo token
- `markAsUsed(tokenId)` - Marcar token como usado
- `deleteExpiredTokens()` - Limpiar tokens expirados

### 3. Servicios

#### EmailService (`src/services/emailService.js`)
- `sendPasswordResetEmail(user, resetToken, resetUrl)` - Enviar email de recuperación
- `sendPasswordChangedEmail(user)` - Enviar email de confirmación
- Templates HTML y texto plano para emails

#### PasswordResetService (`src/services/passwordResetService.js`)
- `requestPasswordReset(email)` - Solicitar recuperación
- `verifyResetToken(token)` - Verificar token
- `resetPassword(token, newPassword)` - Restablecer contraseña
- `cleanupExpiredTokens()` - Limpiar tokens expirados

### 4. Rutas API

#### `/api/password-reset/request` (POST)
```javascript
// Solicitar recuperación
{
    "email": "usuario@example.com"
}

// Respuesta
{
    "success": true,
    "message": "Se ha enviado un correo con las instrucciones...",
    "expiresIn": "1 hora"
}
```

#### `/api/password-reset/verify/:token` (GET)
```javascript
// Respuesta
{
    "success": true,
    "valid": true,
    "user": {
        "id": "user_id",
        "email": "usuario@example.com",
        "first_name": "Juan",
        "last_name": "Pérez"
    },
    "expiresAt": "2024-01-01T12:00:00.000Z"
}
```

#### `/api/password-reset/reset` (POST)
```javascript
// Restablecer contraseña
{
    "token": "reset_token",
    "newPassword": "nueva_contraseña",
    "confirmPassword": "nueva_contraseña"
}

// Respuesta
{
    "success": true,
    "message": "Contraseña restablecida exitosamente..."
}
```

### 5. Vistas

#### `/forgot-password` - Solicitar Recuperación
- Formulario para ingresar email
- Validación en tiempo real
- Indicadores de carga
- Mensajes de éxito/error

#### `/reset-password?token=xxx` - Restablecer Contraseña
- Verificación automática del token
- Formulario para nueva contraseña
- Requisitos de contraseña visibles
- Redirección automática al login

## Flujo del Sistema

### 1. Solicitud de Recuperación
```
Usuario → /forgot-password → Ingresa email → 
API valida usuario → Genera token → Envía email
```

### 2. Verificación de Token
```
Usuario → Hace clic en email → /reset-password?token=xxx →
API verifica token → Muestra formulario si válido
```

### 3. Restablecimiento
```
Usuario → Ingresa nueva contraseña → API valida →
Actualiza contraseña → Marca token como usado → 
Envía email de confirmación → Redirige al login
```

## Configuración de Correo

### Variables de Entorno
```bash
# Configuración SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-de-aplicacion

# Configuración de la aplicación
APP_NAME=Mi Aplicación
FRONTEND_URL=http://localhost:3000
APP_EMAIL=noreply@miapp.com
```

### Configuración Gmail
1. Habilitar autenticación de 2 factores
2. Generar contraseña de aplicación
3. Usar la contraseña de aplicación en `SMTP_PASS`

## Medidas de Seguridad

### 🔒 Seguridad Implementada

1. **Tokens Únicos**
   - Generación con `crypto.randomBytes(32)`
   - 64 caracteres hexadecimales
   - Imposible de adivinar

2. **Expiración Automática**
   - Tokens expiran en 1 hora
   - TTL index en MongoDB
   - Limpieza automática

3. **Prevención de Reutilización**
   - Verificación contra contraseña anterior
   - Verificación contra contraseña actual
   - Tokens de un solo uso

4. **Validaciones**
   - Mínimo 6 caracteres
   - Confirmación de contraseña
   - Validación de email existente

5. **Rate Limiting**
   - Un token activo por usuario
   - Prevención de spam

## Emails Enviados

### 1. Email de Recuperación
- **Asunto**: "Recuperación de Contraseña"
- **Contenido**: 
  - Saludo personalizado
  - Botón de restablecimiento
  - Advertencias de seguridad
  - Enlace de respaldo

### 2. Email de Confirmación
- **Asunto**: "Contraseña Cambiada Exitosamente"
- **Contenido**:
  - Confirmación del cambio
  - Fecha y hora del cambio
  - Advertencia si no fue el usuario

## Rutas Disponibles

### API Endpoints
```
POST /api/password-reset/request     # Solicitar recuperación
GET  /api/password-reset/verify/:token # Verificar token
POST /api/password-reset/reset       # Restablecer contraseña
POST /api/password-reset/cancel      # Cancelar solicitud
GET  /api/password-reset/stats       # Estadísticas (admin)
POST /api/password-reset/cleanup     # Limpiar tokens (admin)
```

### Vistas
```
GET /forgot-password                  # Formulario de solicitud
GET /reset-password?token=xxx        # Formulario de restablecimiento
```

## Ejemplo de Uso

### 1. Solicitar Recuperación
```bash
curl -X POST http://localhost:3000/api/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@example.com"}'
```

### 2. Verificar Token
```bash
curl -X GET http://localhost:3000/api/password-reset/verify/token_here
```

### 3. Restablecer Contraseña
```bash
curl -X POST http://localhost:3000/api/password-reset/reset \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token_here",
    "newPassword": "nueva_contraseña",
    "confirmPassword": "nueva_contraseña"
  }'
```

## Mantenimiento

### Limpieza Automática
```javascript
// Ejecutar cada 24 horas
await passwordResetService.cleanupExpiredTokens();
```

### Estadísticas
```javascript
// Obtener estadísticas de tokens
const stats = await passwordResetService.getTokenStats();
console.log(stats);
// { total: 10, active: 3, expired: 7 }
```

## Próximos Pasos

1. **Rate Limiting**: Implementar límites por IP
2. **Logging**: Registrar intentos de recuperación
3. **Notificaciones**: Alertas de seguridad
4. **Auditoría**: Historial de cambios de contraseña
5. **Backup**: Respaldo de tokens activos

## Conclusión

El sistema de recuperación de contraseña implementado proporciona:

- ✅ **Seguridad robusta** con tokens únicos y expiración
- ✅ **Experiencia de usuario** fluida y clara
- ✅ **Prevención de abuso** con validaciones múltiples
- ✅ **Notificaciones** por email en cada paso
- ✅ **Mantenimiento automático** de tokens expirados

El sistema está listo para producción y cumple con las mejores prácticas de seguridad para recuperación de contraseñas. 