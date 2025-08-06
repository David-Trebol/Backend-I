const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const config = require('../config/environment.config');
const { log } = require('../utils/logger');
const { RateLimitError } = require('../utils/errorHandler');

// Configuración de Redis para rate limiting
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3
});

redis.on('error', (error) => {
    log.error('Redis connection error', { error: error.message });
});

redis.on('connect', () => {
    log.info('Redis connected for rate limiting');
});

// Store personalizado para rate limiting
const createStore = () => {
    if (config.get('isProduction') && process.env.REDIS_HOST) {
        return new RedisStore({
            client: redis,
            prefix: 'rate-limit:',
            resetExpiryOnChange: true
        });
    }
    return null; // Usar store en memoria por defecto
};

// Configuraciones de rate limiting
const rateLimitConfigs = {
    // Rate limiting general
    general: {
        windowMs: config.get('security.rateLimitWindow'),
        max: config.get('security.rateLimitMax'),
        message: {
            error: 'Demasiadas solicitudes',
            details: 'Has excedido el límite de solicitudes. Intenta nuevamente en unos minutos.',
            retryAfter: Math.ceil(config.get('security.rateLimitWindow') / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: createStore()
    },

    // Rate limiting para autenticación
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 5, // 5 intentos
        message: {
            error: 'Demasiados intentos de autenticación',
            details: 'Has excedido el límite de intentos de login. Intenta nuevamente en 15 minutos.',
            retryAfter: 900
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: createStore(),
        skipSuccessfulRequests: true
    },

    // Rate limiting para registro
    register: {
        windowMs: 60 * 60 * 1000, // 1 hora
        max: 3, // 3 intentos
        message: {
            error: 'Demasiados intentos de registro',
            details: 'Has excedido el límite de intentos de registro. Intenta nuevamente en 1 hora.',
            retryAfter: 3600
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: createStore()
    },

    // Rate limiting para recuperación de contraseña
    passwordReset: {
        windowMs: 60 * 60 * 1000, // 1 hora
        max: 3, // 3 intentos
        message: {
            error: 'Demasiados intentos de recuperación',
            details: 'Has excedido el límite de intentos de recuperación de contraseña. Intenta nuevamente en 1 hora.',
            retryAfter: 3600
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: createStore()
    },

    // Rate limiting para API
    api: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // 100 requests
        message: {
            error: 'Límite de API excedido',
            details: 'Has excedido el límite de requests a la API. Intenta nuevamente en 15 minutos.',
            retryAfter: 900
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: createStore()
    },

    // Rate limiting para creación de recursos
    create: {
        windowMs: 60 * 60 * 1000, // 1 hora
        max: 10, // 10 creaciones
        message: {
            error: 'Límite de creación excedido',
            details: 'Has excedido el límite de creación de recursos. Intenta nuevamente en 1 hora.',
            retryAfter: 3600
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: createStore()
    }
};

// Función para crear rate limiter personalizado
const createRateLimiter = (configName, options = {}) => {
    const baseConfig = rateLimitConfigs[configName];
    if (!baseConfig) {
        throw new Error(`Configuración de rate limiting '${configName}' no encontrada`);
    }

    const finalConfig = {
        ...baseConfig,
        ...options,
        handler: (req, res, next) => {
            const error = new RateLimitError(baseConfig.message.error);
            error.retryAfter = baseConfig.message.retryAfter;
            
            log.warn('Rate limit exceeded', {
                ip: req.ip,
                url: req.url,
                method: req.method,
                userAgent: req.get('User-Agent'),
                userId: req.user?.id,
                config: configName
            });

            res.status(429).json({
                error: {
                    message: baseConfig.message.error,
                    details: baseConfig.message.details,
                    retryAfter: baseConfig.message.retryAfter,
                    type: 'RateLimitError',
                    statusCode: 429,
                    timestamp: new Date().toISOString()
                }
            });
        },
        keyGenerator: (req) => {
            // Usar IP por defecto, o user ID si está autenticado
            return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
        },
        skip: (req) => {
            // Saltar rate limiting para admins en desarrollo
            if (config.get('isDevelopment') && req.user?.role === 'admin') {
                return true;
            }
            return false;
        }
    };

    return rateLimit(finalConfig);
};

// Rate limiters específicos
const rateLimiters = {
    // Rate limiting general
    general: createRateLimiter('general'),

    // Rate limiting para autenticación
    auth: createRateLimiter('auth'),

    // Rate limiting para registro
    register: createRateLimiter('register'),

    // Rate limiting para recuperación de contraseña
    passwordReset: createRateLimiter('passwordReset'),

    // Rate limiting para API
    api: createRateLimiter('api'),

    // Rate limiting para creación de recursos
    create: createRateLimiter('create'),

    // Rate limiting personalizado para productos
    products: createRateLimiter('create', {
        windowMs: 60 * 60 * 1000, // 1 hora
        max: 5, // 5 productos por hora
        message: {
            error: 'Límite de creación de productos excedido',
            details: 'Has excedido el límite de creación de productos. Intenta nuevamente en 1 hora.',
            retryAfter: 3600
        }
    }),

    // Rate limiting personalizado para carritos
    carts: createRateLimiter('api', {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 50, // 50 operaciones de carrito
        message: {
            error: 'Límite de operaciones de carrito excedido',
            details: 'Has excedido el límite de operaciones de carrito. Intenta nuevamente en 15 minutos.',
            retryAfter: 900
        }
    })
};

// Middleware para rate limiting dinámico
const dynamicRateLimit = (configName, options = {}) => {
    return createRateLimiter(configName, options);
};

// Middleware para rate limiting por rol
const roleBasedRateLimit = (roleLimits = {}) => {
    return (req, res, next) => {
        const userRole = req.user?.role || 'anonymous';
        const roleConfig = roleLimits[userRole] || roleLimits.default || 'general';
        
        const limiter = createRateLimiter(roleConfig);
        limiter(req, res, next);
    };
};

// Middleware para rate limiting por endpoint
const endpointRateLimit = (endpointLimits = {}) => {
    return (req, res, next) => {
        const endpoint = req.path;
        const method = req.method;
        const key = `${method}:${endpoint}`;
        
        const limitConfig = endpointLimits[key] || endpointLimits.default || 'general';
        const limiter = createRateLimiter(limitConfig);
        
        limiter(req, res, next);
    };
};

// Función para obtener estadísticas de rate limiting
const getRateLimitStats = async () => {
    try {
        if (config.get('isProduction') && process.env.REDIS_HOST) {
            const keys = await redis.keys('rate-limit:*');
            const stats = {};
            
            for (const key of keys) {
                const value = await redis.get(key);
                const ttl = await redis.ttl(key);
                
                stats[key] = {
                    value: parseInt(value) || 0,
                    ttl: ttl
                };
            }
            
            return {
                totalKeys: keys.length,
                stats: stats
            };
        }
        
        return {
            totalKeys: 0,
            stats: {},
            message: 'Rate limiting stats only available with Redis'
        };
    } catch (error) {
        log.error('Error getting rate limit stats', { error: error.message });
        return {
            totalKeys: 0,
            stats: {},
            error: error.message
        };
    }
};

// Función para limpiar rate limiting
const clearRateLimit = async (pattern = '*') => {
    try {
        if (config.get('isProduction') && process.env.REDIS_HOST) {
            const keys = await redis.keys(`rate-limit:${pattern}`);
            if (keys.length > 0) {
                await redis.del(...keys);
                log.info('Rate limit cleared', { pattern, keysDeleted: keys.length });
                return keys.length;
            }
        }
        return 0;
    } catch (error) {
        log.error('Error clearing rate limit', { error: error.message });
        return 0;
    }
};

// Función para verificar rate limit manualmente
const checkRateLimit = async (key, limit, windowMs) => {
    try {
        if (config.get('isProduction') && process.env.REDIS_HOST) {
            const current = await redis.get(`rate-limit:${key}`);
            const count = parseInt(current) || 0;
            
            if (count >= limit) {
                return {
                    exceeded: true,
                    remaining: 0,
                    resetTime: Date.now() + windowMs
                };
            }
            
            return {
                exceeded: false,
                remaining: limit - count,
                resetTime: Date.now() + windowMs
            };
        }
        
        return {
            exceeded: false,
            remaining: limit,
            resetTime: Date.now() + windowMs
        };
    } catch (error) {
        log.error('Error checking rate limit', { error: error.message });
        return {
            exceeded: false,
            remaining: limit,
            resetTime: Date.now() + windowMs
        };
    }
};

module.exports = {
    rateLimiters,
    createRateLimiter,
    dynamicRateLimit,
    roleBasedRateLimit,
    endpointRateLimit,
    getRateLimitStats,
    clearRateLimit,
    checkRateLimit,
    redis
}; 