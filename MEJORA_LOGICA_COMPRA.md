# Mejora en la Lógica de Compra

## Descripción

Se ha implementado una mejora significativa en la lógica de compra del ecommerce, profundizando en los roles de usuarios y las autorizaciones aplicables a cada rol en el contexto de las compras. Esta implementación proporciona un sistema granular de permisos y límites específicos para cada tipo de usuario.

## Características Implementadas

### ✅ **Sistema de Roles Granular**

#### **Roles de Usuario Específicos**
- **customer**: Cliente regular
- **premium**: Cliente premium
- **vip**: Cliente VIP
- **seller**: Vendedor
- **manager**: Gerente de tienda
- **admin**: Administrador del sistema
- **support**: Soporte al cliente
- **finance**: Finanzas
- **logistics**: Logística

#### **Estados de Cuenta**
- **active**: Cuenta activa
- **inactive**: Cuenta inactiva
- **suspended**: Cuenta suspendida
- **pending_verification**: Pendiente de verificación

### ✅ **Permisos por Rol**

#### **Permisos de Visualización**
```javascript
view: {
    customer: ['own_orders', 'own_cart', 'products', 'categories'],
    premium: ['own_orders', 'own_cart', 'products', 'categories', 'wishlist'],
    vip: ['own_orders', 'own_cart', 'products', 'categories', 'wishlist', 'exclusive_products'],
    seller: ['own_orders', 'own_cart', 'products', 'categories', 'wholesale_prices', 'inventory'],
    manager: ['all_orders', 'all_carts', 'products', 'categories', 'wholesale_prices', 'inventory', 'reports'],
    admin: ['all_orders', 'all_carts', 'products', 'categories', 'wholesale_prices', 'inventory', 'reports', 'system'],
    support: ['customer_orders', 'products', 'categories', 'refunds'],
    finance: ['all_orders', 'financial_reports', 'refunds', 'pricing'],
    logistics: ['all_orders', 'shipping', 'inventory', 'delivery_reports']
}
```

#### **Permisos de Creación**
```javascript
create: {
    customer: ['orders', 'cart_items'],
    premium: ['orders', 'cart_items', 'wishlist_items'],
    vip: ['orders', 'cart_items', 'wishlist_items', 'special_orders'],
    seller: ['orders', 'cart_items', 'products', 'inventory_updates'],
    manager: ['orders', 'cart_items', 'products', 'inventory_updates', 'promotions'],
    admin: ['orders', 'cart_items', 'products', 'inventory_updates', 'promotions', 'system_config'],
    support: ['orders', 'refunds'],
    finance: ['orders', 'refunds', 'financial_adjustments'],
    logistics: ['orders', 'shipping_updates', 'inventory_updates']
}
```

#### **Permisos Especiales**
```javascript
special: {
    customer: [],
    premium: ['apply_coupons'],
    vip: ['apply_coupons', 'priority_support', 'exclusive_access'],
    seller: ['apply_coupons', 'wholesale_pricing', 'inventory_management'],
    manager: ['apply_coupons', 'wholesale_pricing', 'inventory_management', 'order_management', 'refund_processing'],
    admin: ['apply_coupons', 'wholesale_pricing', 'inventory_management', 'order_management', 'refund_processing', 'system_management'],
    support: ['apply_coupons', 'refund_processing', 'customer_support'],
    finance: ['apply_coupons', 'refund_processing', 'financial_management'],
    logistics: ['apply_coupons', 'shipping_management', 'inventory_management']
}
```

### ✅ **Límites de Compra por Rol**

#### **Configuración de Límites**
```javascript
purchaseLimits: {
    customer: {
        maxOrderValue: 50000,
        maxItems: 50,
        maxQuantityPerItem: 10,
        canApplyCoupons: false,
        canSeeWholesalePrices: false,
        canManageInventory: false,
        canProcessRefunds: false
    },
    premium: {
        maxOrderValue: 100000,
        maxItems: 100,
        maxQuantityPerItem: 20,
        canApplyCoupons: true,
        canSeeWholesalePrices: false,
        canManageInventory: false,
        canProcessRefunds: false
    },
    vip: {
        maxOrderValue: 500000,
        maxItems: 200,
        maxQuantityPerItem: 50,
        canApplyCoupons: true,
        canSeeWholesalePrices: false,
        canManageInventory: false,
        canProcessRefunds: false
    },
    seller: {
        maxOrderValue: 1000000,
        maxItems: 500,
        maxQuantityPerItem: 100,
        canApplyCoupons: true,
        canSeeWholesalePrices: true,
        canManageInventory: true,
        canProcessRefunds: false
    },
    manager: {
        maxOrderValue: 2000000,
        maxItems: 1000,
        maxQuantityPerItem: 200,
        canApplyCoupons: true,
        canSeeWholesalePrices: true,
        canManageInventory: true,
        canProcessRefunds: true
    },
    admin: {
        maxOrderValue: 999999999,
        maxItems: 9999,
        maxQuantityPerItem: 9999,
        canApplyCoupons: true,
        canSeeWholesalePrices: true,
        canManageInventory: true,
        canProcessRefunds: true
    }
}
```

### ✅ **Descuentos por Rol**

#### **Configuración de Descuentos**
```javascript
const discounts = {
    customer: 0,
    premium: 5,
    vip: 10,
    seller: 15,
    manager: 20,
    admin: 25,
    support: 10,
    finance: 15,
    logistics: 10
};
```

### ✅ **Modelo de Usuario Mejorado**

#### **Información de Compras**
```javascript
purchaseHistory: {
    totalPurchases: Number,
    totalSpent: Number,
    lastPurchase: Date,
    averageOrderValue: Number
}
```

#### **Preferencias de Compra**
```javascript
preferences: {
    preferredCategories: [String],
    preferredPaymentMethod: String,
    newsletterSubscription: Boolean,
    marketingEmails: Boolean
}
```

#### **Información de Contacto**
```javascript
contact: {
    phone: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    }
}
```

#### **Verificación de Cuenta**
```javascript
verification: {
    emailVerified: Boolean,
    phoneVerified: Boolean,
    identityVerified: Boolean,
    emailVerificationToken: String,
    emailVerificationExpires: Date
}
```

#### **Seguridad**
```javascript
security: {
    loginAttempts: Number,
    lockoutUntil: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    twoFactorEnabled: Boolean,
    twoFactorSecret: String
}
```

### ✅ **Modelo de Orden Avanzado**

#### **Información del Cliente**
```javascript
customer: {
    id: ObjectId,
    name: String,
    email: String,
    phone: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    }
}
```

#### **Estados de Orden**
```javascript
status: [
    'pending',           // Pendiente de pago
    'paid',             // Pagado
    'processing',       // En procesamiento
    'shipped',          // Enviado
    'delivered',        // Entregado
    'cancelled',        // Cancelado
    'refunded',         // Reembolsado
    'returned',         // Devuelto
    'on_hold',          // En espera
    'backorder'         // Pedido pendiente
]
```

#### **Autorización de Órdenes**
```javascript
authorization: {
    viewPermissions: [String],
    editPermissions: [String],
    cancelPermissions: [String],
    refundPermissions: [String],
    statusChangePermissions: [String],
    changeHistory: [{
        changedBy: ObjectId,
        changedAt: Date,
        changeType: String,
        previousValue: Mixed,
        newValue: Mixed,
        reason: String
    }]
}
```

### ✅ **Middleware de Autorización Específico**

#### **Verificación de Permisos**
```javascript
const checkPurchasePermission = (permission, resource) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        const userPermissions = purchasePermissions[permission][userRole] || [];
        
        if (!userPermissions.includes(resource)) {
            throw new AuthorizationError(`No tienes permisos para ${permission} ${resource}`);
        }
        
        next();
    };
};
```

#### **Verificación de Límites**
```javascript
const checkPurchaseLimits = (limitType) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        const limits = purchaseLimits[userRole] || purchaseLimits.customer;
        
        switch (limitType) {
            case 'order_value':
                if (req.body.total > limits.maxOrderValue) {
                    throw new ValidationError(`El valor máximo de orden para tu rol es $${limits.maxOrderValue}`);
                }
                break;
            case 'item_quantity':
                if (req.body.quantity > limits.maxQuantityPerItem) {
                    throw new ValidationError(`La cantidad máxima por item para tu rol es ${limits.maxQuantityPerItem}`);
                }
                break;
        }
        
        next();
    };
};
```

#### **Verificación de Propiedad**
```javascript
const checkResourceOwnership = (resourceType) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        const adminRoles = ['manager', 'admin', 'support', 'finance', 'logistics'];
        
        if (adminRoles.includes(userRole)) {
            return next();
        }
        
        // Verificar propiedad específica
        switch (resourceType) {
            case 'order':
                if (req.order.customer.id.toString() !== req.user.id.toString()) {
                    throw new AuthorizationError('Solo puedes acceder a tus propias órdenes');
                }
                break;
        }
        
        next();
    };
};
```

### ✅ **Rutas de Compra con Autorización**

#### **Rutas de Órdenes**
```javascript
// GET /orders - Obtener órdenes del usuario
router.get('/orders', 
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('view', 'own_orders'),
    logPurchaseActivity('VIEW_ORDERS'),
    async (req, res) => { /* ... */ }
);

// POST /orders - Crear nueva orden
router.post('/orders',
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('create', 'orders'),
    checkPurchaseLimits('order_value'),
    checkPurchaseLimits('cart_items'),
    checkCouponPermission(),
    applyRoleDiscount(),
    logPurchaseActivity('CREATE_ORDER'),
    async (req, res) => { /* ... */ }
);
```

#### **Rutas de Carrito**
```javascript
// GET /cart - Obtener carrito del usuario
router.get('/cart',
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('view', 'own_cart'),
    logPurchaseActivity('VIEW_CART'),
    async (req, res) => { /* ... */ }
);

// POST /cart/items - Agregar item al carrito
router.post('/cart/items',
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('create', 'cart_items'),
    checkPurchaseLimits('item_quantity'),
    logPurchaseActivity('ADD_CART_ITEM'),
    async (req, res) => { /* ... */ }
);
```

#### **Rutas de Wishlist**
```javascript
// GET /wishlist - Obtener wishlist del usuario
router.get('/wishlist',
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('view', 'wishlist'),
    logPurchaseActivity('VIEW_WISHLIST'),
    async (req, res) => { /* ... */ }
);
```

#### **Rutas de Cupones**
```javascript
// POST /coupons/apply - Aplicar cupón
router.post('/coupons/apply',
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('special', 'apply_coupons'),
    checkCouponPermission(),
    logPurchaseActivity('APPLY_COUPON'),
    async (req, res) => { /* ... */ }
);
```

## Funcionalidades por Rol

### 🛒 **CUSTOMER (Cliente Regular)**
- **Compras básicas** con límites estrictos
- **Límite de orden**: $50,000
- **Máximo items**: 50
- **Sin cupones** ni descuentos especiales
- **Sin acceso** a precios mayorista
- **Verificación de email** requerida

### ⭐ **PREMIUM (Cliente Premium)**
- **Compras con cupones** habilitados
- **Límite de orden**: $100,000
- **Máximo items**: 100
- **Descuento de rol**: 5%
- **Wishlist** habilitada
- **Soporte mejorado**

### 👑 **VIP (Cliente VIP)**
- **Compras exclusivas** y prioritarias
- **Límite de orden**: $500,000
- **Máximo items**: 200
- **Descuento de rol**: 10%
- **Soporte prioritario**
- **Acceso exclusivo** a productos especiales

### 🏪 **SELLER (Vendedor)**
- **Precios mayorista** habilitados
- **Gestión de inventario** propia
- **Límite de orden**: $1,000,000
- **Máximo items**: 500
- **Descuento de rol**: 15%
- **Cupones** habilitados

### 👨‍💼 **MANAGER (Gerente)**
- **Gestión completa** de órdenes
- **Procesamiento de reembolsos**
- **Límite de orden**: $2,000,000
- **Máximo items**: 1,000
- **Descuento de rol**: 20%
- **Acceso a reportes** y estadísticas

### 🔧 **ADMIN (Administrador)**
- **Acceso total** al sistema
- **Sin límites** de compra
- **Descuento de rol**: 25%
- **Gestión del sistema** completa
- **Todas las funcionalidades** habilitadas

### 🆘 **SUPPORT (Soporte)**
- **Atención al cliente**
- **Procesamiento de reembolsos**
- **Límite de orden**: $100,000
- **Cupones** habilitados
- **Acceso a órdenes** de clientes

### 💰 **FINANCE (Finanzas)**
- **Reportes financieros**
- **Gestión de reembolsos**
- **Precios mayorista** habilitados
- **Límite de orden**: $500,000
- **Descuento de rol**: 15%

### 📦 **LOGISTICS (Logística)**
- **Gestión de envíos**
- **Gestión de inventario**
- **Reportes de entrega**
- **Límite de orden**: $200,000
- **Descuento de rol**: 10%

## Beneficios de la Implementación

### 🔒 **Seguridad Granular**
- **Permisos específicos** por rol y acción
- **Verificación de propiedad** de recursos
- **Límites de compra** por rol
- **Validación de estado** de cuenta

### 📊 **Control de Acceso**
- **Autorización por recurso** específico
- **Verificación de límites** en tiempo real
- **Logging detallado** de actividades
- **Auditoría completa** de cambios

### 🎯 **Experiencia Personalizada**
- **Descuentos automáticos** por rol
- **Funcionalidades específicas** por tipo de usuario
- **Límites apropiados** para cada rol
- **Interfaz adaptada** a las capacidades

### 📈 **Escalabilidad**
- **Roles extensibles** fácilmente
- **Permisos configurables** dinámicamente
- **Límites ajustables** por entorno
- **Middleware reutilizable**

### 🔍 **Observabilidad**
- **Logging estructurado** de actividades
- **Auditoría de cambios** de autorización
- **Métricas por rol** y acción
- **Trazabilidad completa** de operaciones

## Próximos Pasos

1. **Integración con frontend** para mostrar permisos
2. **Panel de administración** de roles
3. **Reportes de autorización** por rol
4. **Notificaciones** de cambios de permisos
5. **Tests automatizados** de autorización
6. **Documentación de API** con permisos
7. **Monitoreo en tiempo real** de actividades

## Conclusión

La mejora en la lógica de compra proporciona:

- ✅ **Sistema granular** de roles y permisos
- ✅ **Autorizaciones específicas** por contexto
- ✅ **Límites de compra** por tipo de usuario
- ✅ **Descuentos automáticos** por rol
- ✅ **Seguridad robusta** con verificación de propiedad
- ✅ **Logging completo** de actividades
- ✅ **Escalabilidad** para futuras expansiones
- ✅ **Experiencia personalizada** por tipo de usuario

Esta implementación establece una base sólida para un sistema de ecommerce profesional con control de acceso granular y experiencia personalizada por tipo de usuario. 