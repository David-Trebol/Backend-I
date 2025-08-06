const { authenticateAndGetUser } = require('./auth.middleware');

// Middleware para autorizar operaciones de productos
const authorizeProductOperations = (operation) => {
    return async (req, res, next) => {
        try {
            // Primero autenticar al usuario
            await authenticateAndGetUser(req, res, (err) => {
                if (err) {
                    return res.status(401).json({ 
                        error: 'Usuario no autenticado',
                        details: 'Debe iniciar sesión para realizar esta operación'
                    });
                }
            });

            // Verificar que el usuario esté autenticado
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Usuario no autenticado',
                    details: 'Debe iniciar sesión para realizar esta operación'
                });
            }

            // Verificar permisos según la operación
            switch (operation) {
                case 'create':
                case 'update':
                case 'delete':
                    if (req.user.role !== 'admin') {
                        return res.status(403).json({
                            error: 'Acceso denegado',
                            details: `Solo los administradores pueden ${operation} productos`,
                            requiredRole: 'admin',
                            currentRole: req.user.role
                        });
                    }
                    break;

                case 'read':
                    // Permitir lectura a todos los usuarios autenticados
                    break;

                default:
                    return res.status(400).json({
                        error: 'Operación no válida',
                        details: 'Operación de producto no reconocida'
                    });
            }

            next();
        } catch (error) {
            console.error('Error en autorización de productos:', error);
            return res.status(500).json({
                error: 'Error interno del servidor',
                details: 'Error al verificar autorización'
            });
        }
    };
};

// Middleware para autorizar operaciones de carrito
const authorizeCartOperations = (operation) => {
    return async (req, res, next) => {
        try {
            // Primero autenticar al usuario
            await authenticateAndGetUser(req, res, (err) => {
                if (err) {
                    return res.status(401).json({ 
                        error: 'Usuario no autenticado',
                        details: 'Debe iniciar sesión para realizar esta operación'
                    });
                }
            });

            // Verificar que el usuario esté autenticado
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Usuario no autenticado',
                    details: 'Debe iniciar sesión para realizar esta operación'
                });
            }

            // Verificar permisos según la operación
            switch (operation) {
                case 'add':
                case 'remove':
                case 'update':
                case 'view':
                    // Permitir operaciones de carrito a usuarios autenticados
                    if (req.user.role !== 'user' && req.user.role !== 'admin') {
                        return res.status(403).json({
                            error: 'Acceso denegado',
                            details: `Solo los usuarios pueden ${operation} productos en el carrito`,
                            requiredRole: 'user',
                            currentRole: req.user.role
                        });
                    }
                    break;

                case 'admin':
                    // Solo administradores pueden ver todos los carritos
                    if (req.user.role !== 'admin') {
                        return res.status(403).json({
                            error: 'Acceso denegado',
                            details: 'Solo los administradores pueden ver todos los carritos',
                            requiredRole: 'admin',
                            currentRole: req.user.role
                        });
                    }
                    break;

                default:
                    return res.status(400).json({
                        error: 'Operación no válida',
                        details: 'Operación de carrito no reconocida'
                    });
            }

            next();
        } catch (error) {
            console.error('Error en autorización de carrito:', error);
            return res.status(500).json({
                error: 'Error interno del servidor',
                details: 'Error al verificar autorización'
            });
        }
    };
};

// Middleware para verificar propiedad del recurso
const authorizeResourceOwnership = (resourceType) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Usuario no autenticado' 
                });
            }

            switch (resourceType) {
                case 'cart':
                    // Verificar que el usuario solo acceda a su propio carrito
                    const cartId = req.params.cid || req.params.id;
                    if (cartId && cartId !== 'current') {
                        // Si es admin, puede acceder a cualquier carrito
                        if (req.user.role === 'admin') {
                            return next();
                        }

                        // Verificar que el carrito pertenezca al usuario
                        const UserManager = require('../managers/UserManager');
                        const userManager = new UserManager();
                        const user = await userManager.getUserById(req.user.id);
                        
                        if (!user || user.cart.toString() !== cartId) {
                            return res.status(403).json({
                                error: 'Acceso denegado',
                                details: 'Solo puede acceder a su propio carrito',
                                resourceType: 'cart',
                                requestedId: cartId
                            });
                        }
                    }
                    break;

                case 'user':
                    // Verificar que el usuario solo acceda a su propio perfil
                    const userId = req.params.id || req.params.uid;
                    if (userId && userId !== req.user.id && req.user.role !== 'admin') {
                        return res.status(403).json({
                            error: 'Acceso denegado',
                            details: 'Solo puede acceder a su propio perfil',
                            resourceType: 'user',
                            requestedId: userId
                        });
                    }
                    break;

                default:
                    return res.status(400).json({
                        error: 'Tipo de recurso no válido',
                        details: 'Tipo de recurso no reconocido'
                    });
            }

            next();
        } catch (error) {
            console.error('Error en verificación de propiedad:', error);
            return res.status(500).json({
                error: 'Error interno del servidor',
                details: 'Error al verificar propiedad del recurso'
            });
        }
    };
};

// Middleware para logging de autorización
const logAuthorization = (operation, resource) => {
    return (req, res, next) => {
        const logData = {
            timestamp: new Date().toISOString(),
            operation: operation,
            resource: resource,
            userId: req.user?.id,
            userRole: req.user?.role,
            userEmail: req.user?.email,
            method: req.method,
            path: req.path,
            ip: req.ip
        };

        console.log('🔐 Autorización:', logData);
        next();
    };
};

// Middleware combinado para productos (autenticación + autorización + logging)
const authorizeProduct = (operation) => {
    return [
        logAuthorization(operation, 'product'),
        authorizeProductOperations(operation)
    ];
};

// Middleware combinado para carritos (autenticación + autorización + logging)
const authorizeCart = (operation) => {
    return [
        logAuthorization(operation, 'cart'),
        authorizeCartOperations(operation)
    ];
};

// Middleware para verificar permisos específicos
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Usuario no autenticado' 
            });
        }

        const permissions = {
            'products.create': ['admin'],
            'products.update': ['admin'],
            'products.delete': ['admin'],
            'products.read': ['user', 'admin'],
            'cart.add': ['user', 'admin'],
            'cart.remove': ['user', 'admin'],
            'cart.update': ['user', 'admin'],
            'cart.view': ['user', 'admin'],
            'cart.admin': ['admin'],
            'users.read': ['user', 'admin'],
            'users.update': ['user', 'admin'],
            'users.delete': ['admin']
        };

        const allowedRoles = permissions[permission];
        if (!allowedRoles) {
            return res.status(400).json({
                error: 'Permiso no válido',
                details: 'Permiso no reconocido'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Acceso denegado',
                details: `No tiene permisos para: ${permission}`,
                requiredRoles: allowedRoles,
                currentRole: req.user.role
            });
        }

        next();
    };
};

module.exports = {
    authorizeProductOperations,
    authorizeCartOperations,
    authorizeResourceOwnership,
    logAuthorization,
    authorizeProduct,
    authorizeCart,
    checkPermission
}; 