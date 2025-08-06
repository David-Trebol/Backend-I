const { log } = require('../utils/logger');
const { 
    AuthorizationError, 
    ValidationError,
    NotFoundError 
} = require('../utils/errorHandler');

// Configuración de permisos por rol para compras
const purchasePermissions = {
    // Permisos de visualización
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
    },
    
    // Permisos de creación
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
    },
    
    // Permisos de modificación
    update: {
        customer: ['own_orders', 'own_cart'],
        premium: ['own_orders', 'own_cart', 'own_wishlist'],
        vip: ['own_orders', 'own_cart', 'own_wishlist'],
        seller: ['own_orders', 'own_cart', 'own_products', 'own_inventory'],
        manager: ['all_orders', 'all_carts', 'all_products', 'all_inventory', 'promotions'],
        admin: ['all_orders', 'all_carts', 'all_products', 'all_inventory', 'promotions', 'system'],
        support: ['customer_orders', 'refunds'],
        finance: ['all_orders', 'refunds', 'pricing'],
        logistics: ['all_orders', 'shipping', 'inventory']
    },
    
    // Permisos de eliminación
    delete: {
        customer: ['own_cart_items'],
        premium: ['own_cart_items', 'own_wishlist_items'],
        vip: ['own_cart_items', 'own_wishlist_items'],
        seller: ['own_cart_items', 'own_products'],
        manager: ['all_cart_items', 'all_products', 'promotions'],
        admin: ['all_cart_items', 'all_products', 'promotions', 'system'],
        support: ['customer_cart_items'],
        finance: ['all_cart_items'],
        logistics: ['all_cart_items', 'inventory_items']
    },
    
    // Permisos especiales
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
};

// Límites de compra por rol
const purchaseLimits = {
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
    },
    support: {
        maxOrderValue: 100000,
        maxItems: 100,
        maxQuantityPerItem: 20,
        canApplyCoupons: true,
        canSeeWholesalePrices: false,
        canManageInventory: false,
        canProcessRefunds: true
    },
    finance: {
        maxOrderValue: 500000,
        maxItems: 200,
        maxQuantityPerItem: 50,
        canApplyCoupons: true,
        canSeeWholesalePrices: true,
        canManageInventory: false,
        canProcessRefunds: true
    },
    logistics: {
        maxOrderValue: 200000,
        maxItems: 150,
        maxQuantityPerItem: 30,
        canApplyCoupons: true,
        canSeeWholesalePrices: false,
        canManageInventory: true,
        canProcessRefunds: false
    }
};

// Middleware para verificar permisos de compra
const checkPurchasePermission = (permission, resource) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new AuthorizationError('Usuario no autenticado');
            }

            const userRole = req.user.role;
            const userPermissions = purchasePermissions[permission][userRole] || [];

            if (!userPermissions.includes(resource)) {
                log.security('PURCHASE_PERMISSION_DENIED', {
                    userId: req.user.id,
                    userRole: userRole,
                    permission: permission,
                    resource: resource,
                    ip: req.ip
                });

                throw new AuthorizationError(`No tienes permisos para ${permission} ${resource}`);
            }

            log.audit('PURCHASE_PERMISSION_GRANTED', {
                userId: req.user.id,
                userRole: userRole,
                permission: permission,
                resource: resource,
                ip: req.ip
            });

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Middleware para verificar límites de compra
const checkPurchaseLimits = (limitType) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new AuthorizationError('Usuario no autenticado');
            }

            const userRole = req.user.role;
            const limits = purchaseLimits[userRole] || purchaseLimits.customer;

            switch (limitType) {
                case 'order_value':
                    const orderValue = req.body.total || 0;
                    if (orderValue > limits.maxOrderValue) {
                        throw new ValidationError(`El valor máximo de orden para tu rol es $${limits.maxOrderValue}`);
                    }
                    break;

                case 'item_quantity':
                    const itemQuantity = req.body.quantity || 0;
                    if (itemQuantity > limits.maxQuantityPerItem) {
                        throw new ValidationError(`La cantidad máxima por item para tu rol es ${limits.maxQuantityPerItem}`);
                    }
                    break;

                case 'cart_items':
                    const cartItems = req.body.items?.length || 0;
                    if (cartItems > limits.maxItems) {
                        throw new ValidationError(`El máximo de items para tu rol es ${limits.maxItems}`);
                    }
                    break;

                case 'coupon_application':
                    if (!limits.canApplyCoupons) {
                        throw new AuthorizationError('No puedes aplicar cupones con tu rol actual');
                    }
                    break;

                case 'wholesale_prices':
                    if (!limits.canSeeWholesalePrices) {
                        throw new AuthorizationError('No puedes ver precios de mayorista con tu rol actual');
                    }
                    break;

                case 'inventory_management':
                    if (!limits.canManageInventory) {
                        throw new AuthorizationError('No puedes gestionar inventario con tu rol actual');
                    }
                    break;

                case 'refund_processing':
                    if (!limits.canProcessRefunds) {
                        throw new AuthorizationError('No puedes procesar reembolsos con tu rol actual');
                    }
                    break;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Middleware para verificar propiedad de recursos
const checkResourceOwnership = (resourceType) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new AuthorizationError('Usuario no autenticado');
            }

            const userRole = req.user.role;
            const resourceId = req.params.id || req.params.orderId || req.params.cartId;

            // Roles que pueden acceder a cualquier recurso
            const adminRoles = ['manager', 'admin', 'support', 'finance', 'logistics'];

            if (adminRoles.includes(userRole)) {
                return next();
            }

            // Para otros roles, verificar propiedad
            switch (resourceType) {
                case 'order':
                    // Verificar que el usuario es el propietario de la orden
                    if (req.order && req.order.customer.id.toString() !== req.user.id.toString()) {
                        throw new AuthorizationError('Solo puedes acceder a tus propias órdenes');
                    }
                    break;

                case 'cart':
                    // Verificar que el usuario es el propietario del carrito
                    if (req.cart && req.cart.user.toString() !== req.user.id.toString()) {
                        throw new AuthorizationError('Solo puedes acceder a tu propio carrito');
                    }
                    break;

                case 'wishlist':
                    // Verificar que el usuario es el propietario de la wishlist
                    if (req.wishlist && req.wishlist.user.toString() !== req.user.id.toString()) {
                        throw new AuthorizationError('Solo puedes acceder a tu propia wishlist');
                    }
                    break;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Middleware para verificar estado de la cuenta
const checkAccountStatus = () => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new AuthorizationError('Usuario no autenticado');
            }

            // Verificar si la cuenta está activa
            if (req.user.status !== 'active') {
                throw new AuthorizationError('Tu cuenta no está activa. Contacta soporte.');
            }

            // Verificar si el usuario está bloqueado
            if (req.user.isLocked()) {
                throw new AuthorizationError('Tu cuenta está temporalmente bloqueada. Intenta más tarde.');
            }

            // Verificar si el email está verificado (para compras)
            if (!req.user.verification.emailVerified) {
                throw new AuthorizationError('Debes verificar tu email antes de realizar compras');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Middleware para aplicar descuentos de rol
const applyRoleDiscount = () => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return next();
            }

            const roleDiscount = req.user.getRoleDiscount();
            if (roleDiscount > 0) {
                req.roleDiscount = roleDiscount;
                log.business('ROLE_DISCOUNT_APPLIED', 'purchase', 'discount', {
                    userId: req.user.id,
                    userRole: req.user.role,
                    discount: roleDiscount
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Middleware para verificar cupones
const checkCouponPermission = () => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return next();
            }

            const canApplyCoupons = req.user.canApplyCoupons();
            if (!canApplyCoupons && req.body.couponCode) {
                throw new AuthorizationError('No puedes aplicar cupones con tu rol actual');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Middleware para logging de compras
const logPurchaseActivity = (activity) => {
    return (req, res, next) => {
        try {
            if (req.user) {
                log.business(activity, 'purchase', 'activity', {
                    userId: req.user.id,
                    userRole: req.user.role,
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    method: req.method,
                    path: req.path
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};

// Función para obtener permisos del usuario
const getUserPermissions = (userRole) => {
    return {
        view: purchasePermissions.view[userRole] || [],
        create: purchasePermissions.create[userRole] || [],
        update: purchasePermissions.update[userRole] || [],
        delete: purchasePermissions.delete[userRole] || [],
        special: purchasePermissions.special[userRole] || [],
        limits: purchaseLimits[userRole] || purchaseLimits.customer
    };
};

// Función para verificar si un usuario puede realizar una acción específica
const canPerformAction = (userRole, action, resource) => {
    const permissions = purchasePermissions[action][userRole] || [];
    return permissions.includes(resource);
};

module.exports = {
    checkPurchasePermission,
    checkPurchaseLimits,
    checkResourceOwnership,
    checkAccountStatus,
    applyRoleDiscount,
    checkCouponPermission,
    logPurchaseActivity,
    getUserPermissions,
    canPerformAction,
    purchasePermissions,
    purchaseLimits
}; 