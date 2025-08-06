# Patrón Repository

## Descripción

El patrón Repository ha sido implementado para separar la lógica de acceso a datos de la lógica de negocio, proporcionando una capa de abstracción entre los managers y los modelos de datos.

## Estructura

```
src/repositories/
├── BaseRepository.js      # Clase base con operaciones CRUD comunes
├── ProductRepository.js   # Repositorio específico para productos
├── CartRepository.js      # Repositorio específico para carritos
├── UserRepository.js      # Repositorio específico para usuarios
└── index.js              # Exportaciones centralizadas
```

## BaseRepository

La clase base proporciona operaciones CRUD comunes:

- `findAll(filter, options)` - Obtener todos los registros con filtros y opciones
- `findById(id)` - Buscar por ID
- `findOne(filter)` - Buscar un registro por filtro
- `create(data)` - Crear nuevo registro
- `update(id, data)` - Actualizar registro
- `delete(id)` - Eliminar registro
- `count(filter)` - Contar registros
- `exists(filter)` - Verificar existencia

## Repositorios Específicos

### ProductRepository

Métodos específicos para productos:

- `findByCode(code)` - Buscar producto por código
- `findByCategory(category, options)` - Buscar por categoría
- `findByPriceRange(minPrice, maxPrice, options)` - Buscar por rango de precio
- `findInStock(options)` - Buscar productos en stock
- `updateStock(id, quantity)` - Actualizar stock
- `createWithValidation(productData)` - Crear con validaciones
- `deleteWithEvent(id)` - Eliminar con eventos de socket

### CartRepository

Métodos específicos para carritos:

- `findByIdWithProducts(id)` - Buscar carrito con productos populados
- `addProductToCart(cartId, productId, quantity)` - Agregar producto al carrito
- `removeProductFromCart(cartId, productId)` - Remover producto del carrito
- `updateProductQuantity(cartId, productId, quantity)` - Actualizar cantidad
- `clearCart(cartId)` - Vaciar carrito
- `getCartTotal(cartId)` - Obtener total del carrito
- `getCartItemCount(cartId)` - Obtener cantidad de items

### UserRepository

Métodos específicos para usuarios:

- `findByEmail(email)` - Buscar usuario por email
- `findByIdWithCart(id)` - Buscar usuario con carrito
- `createWithCart(userData)` - Crear usuario con carrito
- `updateUserRole(id, role)` - Actualizar rol de usuario
- `findAdmins()` - Buscar administradores
- `findUsersByRole(role)` - Buscar usuarios por rol
- `findUsersByAgeRange(minAge, maxAge)` - Buscar por rango de edad
- `deleteWithCart(id)` - Eliminar usuario con carrito

## Beneficios

1. **Separación de responsabilidades**: Los managers se enfocan en la lógica de negocio
2. **Reutilización**: Operaciones comunes en BaseRepository
3. **Mantenibilidad**: Cambios en acceso a datos centralizados
4. **Testabilidad**: Fácil mock de repositorios para testing
5. **Flexibilidad**: Fácil cambio de fuente de datos

## Uso en Managers

Los managers ahora utilizan los repositorios en lugar de acceder directamente a los modelos:

```javascript
// Antes
const product = await Product.findById(id);

// Ahora
const product = await this.productRepository.findById(id);
```

## Eventos y Validaciones

Los repositorios manejan eventos de socket y validaciones específicas del dominio, manteniendo la lógica de negocio encapsulada. 