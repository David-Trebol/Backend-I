# Documentación de Rutas del Proyecto

## Índice
1. [Autenticación y Usuarios](#autenticación-y-usuarios)
2. [Productos](#productos)
3. [Carritos](#carritos)
4. [Compras y Órdenes](#compras-y-órdenes)
5. [Estadísticas y Auditoría](#estadísticas-y-auditoría)
6. [Recuperación de Contraseña](#recuperación-de-contraseña)
7. [Vistas](#vistas)
8. [Mascotas](#mascotas)
9. [Mocks](#mocks)

---

## Autenticación y Usuarios

### Rutas de Autenticación (`/api/auth`)

#### POST `/api/auth/register`
- **Descripción**: Registro de nuevo usuario
- **Body**: 
  ```json
  {
    "firstName": "string",
    "lastName": "string", 
    "email": "string",
    "password": "string",
    "age": "number",
    "role": "customer|admin"
  }
  ```
- **Respuesta**: Usuario creado (sin información sensible)

#### POST `/api/auth/login`
- **Descripción**: Inicio de sesión
- **Body**: 
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Respuesta**: Token JWT y datos del usuario

#### GET `/api/auth/current`
- **Descripción**: Obtener usuario autenticado
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Datos del usuario autenticado

#### GET `/api/auth/current/profile`
- **Descripción**: Obtener perfil completo del usuario
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Perfil completo del usuario

#### GET `/api/auth/current/basic`
- **Descripción**: Obtener información básica del usuario
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Información básica del usuario

### Rutas de Usuarios (`/api/users`)

#### GET `/api/users`
- **Descripción**: Obtener todos los usuarios con filtros
- **Query Params**: `limit`, `page`, `sort`, `role`, `minAge`, `maxAge`
- **Respuesta**: Lista de usuarios paginada

#### GET `/api/users/admins`
- **Descripción**: Obtener todos los administradores
- **Respuesta**: Lista de usuarios administradores

#### GET `/api/users/:id`
- **Descripción**: Obtener usuario por ID
- **Respuesta**: Datos del usuario

#### GET `/api/users/:id/detail`
- **Descripción**: Obtener usuario con carrito
- **Respuesta**: Usuario con información del carrito

#### GET `/api/users/email/:email`
- **Descripción**: Obtener usuario por email
- **Respuesta**: Datos del usuario

#### POST `/api/users`
- **Descripción**: Crear nuevo usuario
- **Body**: Datos del usuario
- **Respuesta**: Usuario creado

#### PUT `/api/users/:id`
- **Descripción**: Actualizar usuario
- **Body**: Datos a actualizar
- **Respuesta**: Usuario actualizado

#### PATCH `/api/users/:id/role`
- **Descripción**: Actualizar rol de usuario
- **Body**: `{"role": "user|admin"}`
- **Respuesta**: Usuario con rol actualizado

#### PATCH `/api/users/:id/password`
- **Descripción**: Actualizar contraseña
- **Body**: `{"password": "string"}`
- **Respuesta**: Usuario con contraseña actualizada

#### DELETE `/api/users/:id`
- **Descripción**: Eliminar usuario
- **Respuesta**: Status 204

#### GET `/api/users/stats/count`
- **Descripción**: Obtener cantidad total de usuarios
- **Query Params**: `role` (opcional)
- **Respuesta**: `{"count": number}`

---

## Productos

### Rutas de Productos (`/api/products`)

#### GET `/api/products`
- **Descripción**: Obtener productos con filtros, paginación y ordenamiento
- **Query Params**: 
  - `limit`: Número de productos por página (default: 10)
  - `page`: Número de página (default: 1)
  - `sort`: Ordenamiento por precio (`asc` o `desc`)
  - `query`: Filtros en formato JSON
    - `category`: Categoría del producto
    - `status`: Estado del producto (`true`/`false`)
- **Respuesta**: Lista paginada con metadatos de paginación

#### GET `/api/products/:id`
- **Descripción**: Obtener producto por ID
- **Respuesta**: Datos del producto

#### POST `/api/products`
- **Descripción**: Agregar nuevo producto
- **Body**: Datos del producto
- **Respuesta**: Producto creado

#### PUT `/api/products/:id`
- **Descripción**: Actualizar producto
- **Body**: Datos a actualizar
- **Respuesta**: Producto actualizado

#### DELETE `/api/products/:id`
- **Descripción**: Eliminar producto
- **Respuesta**: Status 204

---

## Carritos

### Rutas de Carritos (`/api/carts`)

#### GET `/api/carts`
- **Descripción**: Obtener todos los carritos
- **Respuesta**: Lista de carritos

#### GET `/api/carts/:id`
- **Descripción**: Obtener carrito por ID
- **Respuesta**: Datos del carrito

#### POST `/api/carts`
- **Descripción**: Crear nuevo carrito
- **Body**: Datos del carrito
- **Respuesta**: Carrito creado

#### PUT `/api/carts/:id`
- **Descripción**: Actualizar carrito
- **Body**: Datos a actualizar
- **Respuesta**: Carrito actualizado

#### DELETE `/api/carts/:id`
- **Descripción**: Eliminar carrito
- **Respuesta**: Status 204

---

## Compras y Órdenes

### Rutas de Compras (`/api/purchase`)

#### Órdenes

##### GET `/api/purchase/orders`
- **Descripción**: Obtener órdenes del usuario autenticado
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Lista de órdenes del usuario

##### GET `/api/purchase/orders/:orderId`
- **Descripción**: Obtener orden específica
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Datos de la orden

##### POST `/api/purchase/orders`
- **Descripción**: Crear nueva orden
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
  ```json
  {
    "items": [{"productId": "string", "quantity": "number"}],
    "paymentMethod": "string",
    "shippingMethod": "string",
    "shippingCost": "number",
    "notes": "string"
  }
  ```
- **Respuesta**: Orden creada

##### PUT `/api/purchase/orders/:orderId/cancel`
- **Descripción**: Cancelar orden
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{"reason": "string"}`
- **Respuesta**: Orden cancelada

#### Carrito

##### GET `/api/purchase/cart`
- **Descripción**: Obtener carrito del usuario
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Datos del carrito

##### POST `/api/purchase/cart/items`
- **Descripción**: Agregar item al carrito
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{"productId": "string", "quantity": "number"}`
- **Respuesta**: Item agregado al carrito

##### PUT `/api/purchase/cart/items/:itemId`
- **Descripción**: Actualizar cantidad de item
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{"quantity": "number"}`
- **Respuesta**: Cantidad actualizada

##### DELETE `/api/purchase/cart/items/:itemId`
- **Descripción**: Eliminar item del carrito
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Item eliminado

#### Wishlist

##### GET `/api/purchase/wishlist`
- **Descripción**: Obtener wishlist del usuario
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Lista de productos en wishlist

##### POST `/api/purchase/wishlist/items`
- **Descripción**: Agregar producto a wishlist
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{"productId": "string"}`
- **Respuesta**: Producto agregado a wishlist

##### DELETE `/api/purchase/wishlist/items/:productId`
- **Descripción**: Eliminar producto de wishlist
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Producto eliminado de wishlist

#### Cupones

##### POST `/api/purchase/coupons/apply`
- **Descripción**: Aplicar cupón a orden
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{"couponCode": "string", "orderId": "string"}`
- **Respuesta**: Cupón aplicado

#### Permisos

##### GET `/api/purchase/permissions`
- **Descripción**: Obtener permisos del usuario
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Permisos, límites y descuentos del usuario

---

## Estadísticas y Auditoría

### Rutas de Estadísticas (`/api/stats`)

#### GET `/api/stats/access`
- **Descripción**: Estadísticas de acceso (solo admin)
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Estadísticas de acceso del sistema

#### GET `/api/stats/authorization`
- **Descripción**: Estadísticas de autorización (solo admin)
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Estadísticas de autorización y permisos

#### GET `/api/stats/audit`
- **Descripción**: Logs de auditoría (solo admin)
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Logs de auditoría recientes

#### GET `/api/stats/security`
- **Descripción**: Reporte de seguridad (solo admin)
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Reporte de seguridad y recomendaciones

---

## Recuperación de Contraseña

### Rutas de Recuperación (`/api/password-reset`)

#### POST `/api/password-reset/request`
- **Descripción**: Solicitar recuperación de contraseña
- **Body**: `{"email": "string"}`
- **Respuesta**: Confirmación de solicitud

#### GET `/api/password-reset/verify/:token`
- **Descripción**: Verificar token de recuperación
- **Respuesta**: Validez del token

#### POST `/api/password-reset/reset`
- **Descripción**: Restablecer contraseña
- **Body**: 
  ```json
  {
    "token": "string",
    "newPassword": "string",
    "confirmPassword": "string"
  }
  ```
- **Respuesta**: Confirmación de restablecimiento

#### POST `/api/password-reset/cancel`
- **Descripción**: Cancelar solicitud de recuperación
- **Body**: `{"token": "string"}`
- **Respuesta**: Confirmación de cancelación

#### GET `/api/password-reset/stats`
- **Descripción**: Estadísticas de tokens (solo admin)
- **Respuesta**: Estadísticas de tokens de recuperación

#### POST `/api/password-reset/cleanup`
- **Descripción**: Limpiar tokens expirados (solo admin)
- **Respuesta**: Confirmación de limpieza

---

## Vistas

### Rutas de Vistas (`/`)

#### GET `/`
- **Descripción**: Página de inicio
- **Respuesta**: Vista home con productos

#### GET `/products`
- **Descripción**: Página de productos
- **Respuesta**: Vista de lista de productos

#### GET `/products/:id`
- **Descripción**: Página de detalle de producto
- **Respuesta**: Vista de detalle de producto

#### GET `/realtimeproducts`
- **Descripción**: Página de productos en tiempo real
- **Respuesta**: Vista con WebSocket para productos

#### GET `/carts/:id`
- **Descripción**: Página de detalle de carrito
- **Respuesta**: Vista de carrito específico

#### GET `/forgot-password`
- **Descripción**: Página de recuperación de contraseña
- **Respuesta**: Formulario de solicitud

#### GET `/reset-password/:token`
- **Descripción**: Página de restablecimiento de contraseña
- **Respuesta**: Formulario de restablecimiento

---

## Mascotas

### Rutas de Mascotas (`/api/pets`)

#### GET `/api/pets`
- **Descripción**: Listar todas las mascotas
- **Respuesta**: Lista de mascotas

#### POST `/api/pets`
- **Descripción**: Crear nueva mascota
- **Body**: Datos de la mascota
- **Respuesta**: Mascota creada

#### GET `/api/pets/:id`
- **Descripción**: Obtener mascota por ID
- **Respuesta**: Datos de la mascota

#### PUT `/api/pets/:id`
- **Descripción**: Actualizar mascota
- **Body**: Datos a actualizar
- **Respuesta**: Mascota actualizada

#### DELETE `/api/pets/:id`
- **Descripción**: Eliminar mascota
- **Respuesta**: Status 204

---

## Mocks

### Rutas de Mocks (`/api/mocks`)

#### GET `/api/mocks/mockingpets`
- **Descripción**: Generar datos mock de mascotas
- **Query Params**: `count` (default: 50)
- **Respuesta**: Lista de mascotas mock

#### GET `/api/mocks/mockingusers`
- **Descripción**: Generar datos mock de usuarios
- **Query Params**: `count` (default: 50)
- **Respuesta**: Lista de usuarios mock

#### POST `/api/mocks/generateData`
- **Descripción**: Insertar datos mock en la base de datos
- **Body**: 
  ```json
  {
    "users": "number",
    "pets": "number"
  }
  ```
- **Respuesta**: Confirmación de inserción

---

## Sesiones

### Rutas de Sesiones (`/api/sessions`)

#### GET `/api/sessions/current`
- **Descripción**: Obtener usuario de sesión activa
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Datos del usuario autenticado

#### GET `/api/sessions/current/token`
- **Descripción**: Obtener información del token sin consultar BD
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: Información del token decodificado

---

## Notas Importantes

### Autenticación
- Todas las rutas protegidas requieren el header `Authorization: Bearer <token>`
- Los tokens JWT tienen un tiempo de expiración configurado
- Los usuarios pueden tener roles: `customer` o `admin`

### Paginación
- Las rutas que soportan paginación usan los parámetros `limit` y `page`
- La respuesta incluye metadatos de paginación (`totalPages`, `prevPage`, `nextPage`, etc.)

### Filtros
- Los filtros se pueden aplicar usando query parameters
- Para filtros complejos se usa el parámetro `query` con formato JSON

### Middleware de Autorización
- Se aplican diferentes niveles de permisos según el rol del usuario
- Los administradores tienen acceso completo
- Los usuarios regulares tienen acceso limitado a sus propios recursos

### Validación
- Se aplica validación de datos en todas las rutas
- Los errores de validación devuelven códigos de estado HTTP apropiados
- Se incluyen mensajes de error descriptivos

### Logging y Auditoría
- Todas las acciones importantes se registran en logs
- Se mantiene un registro de auditoría para actividades sensibles
- Los logs incluyen información del usuario, timestamp y detalles de la acción
