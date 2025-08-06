const NodeCache = require('node-cache');
const config = require('../config/environment.config');
const { log } = require('./logger');

class CacheManager {
    constructor() {
        this.cache = new NodeCache({
            stdTTL: config.get('cache.ttl'),
            checkperiod: config.get('cache.checkPeriod'),
            maxKeys: config.get('cache.maxSize'),
            useClones: false,
            deleteOnExpire: true
        });

        // Eventos del caché
        this.cache.on('expired', (key, value) => {
            log.debug('Cache expired', { key, value });
        });

        this.cache.on('flush', () => {
            log.info('Cache flushed');
        });

        this.cache.on('del', (key, value) => {
            log.debug('Cache deleted', { key, value });
        });
    }

    // Obtener valor del caché
    get(key) {
        try {
            const value = this.cache.get(key);
            if (value !== undefined) {
                log.debug('Cache hit', { key });
                return value;
            }
            log.debug('Cache miss', { key });
            return null;
        } catch (error) {
            log.error('Cache get error', { key, error: error.message });
            return null;
        }
    }

    // Establecer valor en caché
    set(key, value, ttl = null) {
        try {
            const success = this.cache.set(key, value, ttl);
            if (success) {
                log.debug('Cache set', { key, ttl });
            }
            return success;
        } catch (error) {
            log.error('Cache set error', { key, error: error.message });
            return false;
        }
    }

    // Eliminar valor del caché
    delete(key) {
        try {
            const deleted = this.cache.del(key);
            if (deleted > 0) {
                log.debug('Cache deleted', { key });
            }
            return deleted > 0;
        } catch (error) {
            log.error('Cache delete error', { key, error: error.message });
            return false;
        }
    }

    // Verificar si existe en caché
    has(key) {
        return this.cache.has(key);
    }

    // Obtener múltiples valores
    getMultiple(keys) {
        try {
            const values = this.cache.mget(keys);
            log.debug('Cache getMultiple', { keys, found: Object.keys(values).length });
            return values;
        } catch (error) {
            log.error('Cache getMultiple error', { keys, error: error.message });
            return {};
        }
    }

    // Establecer múltiples valores
    setMultiple(keyValuePairs, ttl = null) {
        try {
            const success = this.cache.mset(keyValuePairs);
            if (success) {
                log.debug('Cache setMultiple', { 
                    keys: Object.keys(keyValuePairs),
                    ttl 
                });
            }
            return success;
        } catch (error) {
            log.error('Cache setMultiple error', { error: error.message });
            return false;
        }
    }

    // Eliminar múltiples valores
    deleteMultiple(keys) {
        try {
            const deleted = this.cache.del(keys);
            log.debug('Cache deleteMultiple', { keys, deleted });
            return deleted;
        } catch (error) {
            log.error('Cache deleteMultiple error', { keys, error: error.message });
            return 0;
        }
    }

    // Limpiar todo el caché
    flush() {
        try {
            this.cache.flushAll();
            log.info('Cache flushed');
            return true;
        } catch (error) {
            log.error('Cache flush error', { error: error.message });
            return false;
        }
    }

    // Obtener estadísticas del caché
    getStats() {
        try {
            const stats = this.cache.getStats();
            return {
                keys: stats.keys,
                hits: stats.hits,
                misses: stats.misses,
                keyCount: stats.ksize,
                hitRate: stats.hits / (stats.hits + stats.misses) * 100
            };
        } catch (error) {
            log.error('Cache stats error', { error: error.message });
            return null;
        }
    }

    // Obtener todas las claves
    getKeys() {
        try {
            return this.cache.keys();
        } catch (error) {
            log.error('Cache getKeys error', { error: error.message });
            return [];
        }
    }

    // Obtener valor o establecer si no existe
    async getOrSet(key, fetchFunction, ttl = null) {
        try {
            let value = this.get(key);
            
            if (value === null) {
                log.debug('Cache miss, fetching data', { key });
                value = await fetchFunction();
                
                if (value !== null && value !== undefined) {
                    this.set(key, value, ttl);
                    log.debug('Cache set from fetch', { key });
                }
            }
            
            return value;
        } catch (error) {
            log.error('Cache getOrSet error', { key, error: error.message });
            return null;
        }
    }

    // Invalidar caché por patrón
    invalidatePattern(pattern) {
        try {
            const keys = this.getKeys();
            const matchingKeys = keys.filter(key => key.includes(pattern));
            
            if (matchingKeys.length > 0) {
                this.deleteMultiple(matchingKeys);
                log.info('Cache invalidated by pattern', { pattern, keys: matchingKeys });
            }
            
            return matchingKeys.length;
        } catch (error) {
            log.error('Cache invalidatePattern error', { pattern, error: error.message });
            return 0;
        }
    }

    // Caché con TTL personalizado
    setWithTTL(key, value, ttl) {
        return this.set(key, value, ttl);
    }

    // Caché persistente (sin TTL)
    setPersistent(key, value) {
        return this.set(key, value, 0);
    }

    // Renovar TTL de una clave
    touch(key, ttl = null) {
        try {
            const value = this.get(key);
            if (value !== null) {
                return this.set(key, value, ttl);
            }
            return false;
        } catch (error) {
            log.error('Cache touch error', { key, error: error.message });
            return false;
        }
    }
}

// Instancia global del caché
const cacheManager = new CacheManager();

// Middleware para caché de respuestas HTTP
const cacheMiddleware = (ttl = 300) => {
    return (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const cacheKey = `http:${req.originalUrl}`;
        const cachedResponse = cacheManager.get(cacheKey);

        if (cachedResponse) {
            log.debug('Cache hit for HTTP response', { url: req.originalUrl });
            return res.json(cachedResponse);
        }

        // Interceptar la respuesta
        const originalJson = res.json;
        res.json = function(data) {
            cacheManager.set(cacheKey, data, ttl);
            log.debug('Cache set for HTTP response', { url: req.originalUrl, ttl });
            return originalJson.call(this, data);
        };

        next();
    };
};

// Middleware para invalidar caché
const invalidateCache = (pattern) => {
    return (req, res, next) => {
        const invalidated = cacheManager.invalidatePattern(pattern);
        log.info('Cache invalidated', { pattern, invalidated });
        next();
    };
};

// Decorador para caché de métodos
const cacheMethod = (ttl = 300) => {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = async function(...args) {
            const cacheKey = `method:${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
            
            try {
                const cachedResult = cacheManager.get(cacheKey);
                if (cachedResult !== null) {
                    log.debug('Cache hit for method', { 
                        method: propertyKey, 
                        class: target.constructor.name 
                    });
                    return cachedResult;
                }

                const result = await originalMethod.apply(this, args);
                
                if (result !== null && result !== undefined) {
                    cacheManager.set(cacheKey, result, ttl);
                    log.debug('Cache set for method', { 
                        method: propertyKey, 
                        class: target.constructor.name,
                        ttl 
                    });
                }

                return result;
            } catch (error) {
                log.error('Cache method error', { 
                    method: propertyKey, 
                    class: target.constructor.name,
                    error: error.message 
                });
                return await originalMethod.apply(this, args);
            }
        };

        return descriptor;
    };
};

module.exports = {
    cacheManager,
    cacheMiddleware,
    invalidateCache,
    cacheMethod
}; 