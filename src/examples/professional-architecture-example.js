const config = require('../config/environment.config');
const { log } = require('../utils/logger');
const { cacheManager } = require('../utils/cache');
const { validate, schemas } = require('../utils/validator');
const { 
    ValidationError, 
    AuthenticationError, 
    AuthorizationError,
    NotFoundError,
    ConflictError 
} = require('../utils/errorHandler');

// Ejemplo de uso de la arquitectura profesional
async function ejemploArquitecturaProfesional() {
    try {
        console.log('=== Ejemplo de Arquitectura Profesional ===\n');

        // 1. Configuración profesional
        console.log('1. Configuración profesional...');
        console.log(`🌍 Entorno: ${config.get('environment')}`);
        console.log(`📍 Puerto: ${config.get('app.port')}`);
        console.log(`🔐 JWT Secret configurado: ${config.get('app.jwtSecret') ? 'SÍ' : 'NO'}`);
        console.log(`📧 Email configurado: ${config.get('email.auth.user') ? 'SÍ' : 'NO'}`);
        console.log(`💾 Caché habilitado: ${config.get('cache.enabled') ? 'SÍ' : 'NO'}`);

        // 2. Sistema de logging profesional
        console.log('\n2. Sistema de logging profesional...');
        
        log.info('Iniciando aplicación', {
            environment: config.get('environment'),
            timestamp: new Date().toISOString()
        });

        log.audit('USER_LOGIN', {
            userId: 123,
            email: 'usuario@example.com',
            ip: '192.168.1.1',
            userAgent: 'Mozilla/5.0...'
        });

        log.security('FAILED_LOGIN_ATTEMPT', {
            email: 'intruso@example.com',
            ip: '192.168.1.100',
            reason: 'Invalid password'
        });

        log.performance('DB_QUERY', 45, {
            collection: 'users',
            operation: 'find',
            query: { email: 'usuario@example.com' }
        });

        log.business('PRODUCT_CREATED', 'product', 'create', {
            productId: '507f1f77bcf86cd799439011',
            createdBy: 'admin@example.com',
            title: 'Nuevo Producto'
        });

        // 3. Sistema de caché avanzado
        console.log('\n3. Sistema de caché avanzado...');
        
        // Caché básico
        cacheManager.set('user:123', { id: 123, name: 'Juan' }, 300);
        const user = cacheManager.get('user:123');
        console.log('✅ Usuario en caché:', user ? 'Encontrado' : 'No encontrado');

        // Caché con función de fetch
        const cachedData = await cacheManager.getOrSet('products:featured', async () => {
            console.log('🔄 Obteniendo productos destacados...');
            return [
                { id: 1, name: 'Producto 1', price: 100 },
                { id: 2, name: 'Producto 2', price: 200 }
            ];
        }, 600);
        console.log('✅ Productos destacados:', cachedData.length, 'productos');

        // Estadísticas de caché
        const stats = cacheManager.getStats();
        console.log('📊 Estadísticas de caché:', {
            keys: stats.keys,
            hits: stats.hits,
            misses: stats.misses,
            hitRate: `${stats.hitRate.toFixed(2)}%`
        });

        // 4. Sistema de validación robusto
        console.log('\n4. Sistema de validación robusto...');
        
        // Validación de usuario
        const userData = {
            first_name: 'Juan',
            last_name: 'Pérez',
            email: 'juan@example.com',
            age: 25,
            password: 'Password123!',
            role: 'user'
        };

        const validationResult = validate(schemas.user.create, userData);
        if (validationResult.isValid) {
            console.log('✅ Datos de usuario válidos');
        } else {
            console.log('❌ Errores de validación:', validationResult.errors);
        }

        // Validación de producto
        const productData = {
            title: 'Laptop Gaming',
            description: 'Laptop para gaming de alto rendimiento',
            code: 'LAP001',
            price: 1500.50,
            stock: 10,
            category: 'Electrónicos'
        };

        const productValidation = validate(schemas.product.create, productData);
        if (productValidation.isValid) {
            console.log('✅ Datos de producto válidos');
        } else {
            console.log('❌ Errores de validación:', productValidation.errors);
        }

        // 5. Manejo de errores profesional
        console.log('\n5. Manejo de errores profesional...');
        
        const errorExamples = [
            {
                name: 'ValidationError',
                error: new ValidationError('Datos de entrada inválidos', [
                    { field: 'email', message: 'Email inválido' }
                ])
            },
            {
                name: 'AuthenticationError',
                error: new AuthenticationError('Token expirado')
            },
            {
                name: 'AuthorizationError',
                error: new AuthorizationError('No tienes permisos para esta operación')
            },
            {
                name: 'NotFoundError',
                error: new NotFoundError('Usuario')
            },
            {
                name: 'ConflictError',
                error: new ConflictError('El email ya está registrado')
            }
        ];

        errorExamples.forEach(({ name, error }) => {
            console.log(`📋 ${name}:`, {
                message: error.message,
                statusCode: error.statusCode,
                type: error.type,
                timestamp: error.timestamp
            });
        });

        // 6. Simulación de operaciones con logging
        console.log('\n6. Simulación de operaciones con logging...');
        
        // Simular login exitoso
        log.audit('USER_LOGIN_SUCCESS', {
            userId: 123,
            email: 'usuario@example.com',
            ip: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });

        // Simular creación de producto
        log.business('PRODUCT_CREATED', 'product', 'create', {
            productId: '507f1f77bcf86cd799439011',
            createdBy: 'admin@example.com',
            title: 'Nuevo Producto',
            price: 100,
            category: 'Electrónicos'
        });

        // Simular operación de carrito
        log.business('CART_ITEM_ADDED', 'cart', 'add', {
            cartId: '507f1f77bcf86cd799439012',
            productId: '507f1f77bcf86cd799439011',
            quantity: 2,
            userId: 123
        });

        // Simular error de base de datos
        log.error('Database connection failed', {
            error: 'Connection timeout',
            operation: 'user.find',
            duration: 5000,
            retries: 3
        });

        // 7. Configuración por entorno
        console.log('\n7. Configuración por entorno...');
        
        const environmentConfig = {
            isDevelopment: config.get('isDevelopment'),
            isProduction: config.get('isProduction'),
            isTest: config.get('isTest'),
            logLevel: config.get('logging.level'),
            cacheEnabled: config.get('cache.enabled'),
            rateLimitEnabled: config.get('app.enableRateLimit'),
            auditEnabled: config.get('app.enableAudit')
        };

        console.log('🔧 Configuración actual:', environmentConfig);

        // 8. Métricas y estadísticas
        console.log('\n8. Métricas y estadísticas...');
        
        const metrics = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version,
            platform: process.platform,
            cacheStats: cacheManager.getStats(),
            timestamp: new Date().toISOString()
        };

        console.log('📊 Métricas del sistema:', {
            uptime: `${Math.floor(metrics.uptime)}s`,
            memoryUsage: `${Math.round(metrics.memory.heapUsed / 1024 / 1024)}MB`,
            nodeVersion: metrics.nodeVersion,
            platform: metrics.platform,
            cacheHitRate: `${metrics.cacheStats.hitRate.toFixed(2)}%`
        });

        console.log('\n=== Ejemplo completado exitosamente ===');

    } catch (error) {
        log.error('Error en ejemplo de arquitectura', {
            error: error.message,
            stack: error.stack
        });
        console.error('❌ Error en el ejemplo:', error.message);
    }
}

// Ejemplo de configuración de variables de entorno
function ejemploConfiguracionEntorno() {
    console.log('\n=== Configuración de Variables de Entorno ===\n');

    console.log('🔧 Variables de entorno requeridas:');
    console.log('');
    console.log('📋 DESARROLLO:');
    console.log('  NODE_ENV=development');
    console.log('  PORT=3000');
    console.log('  MONGO_URI=mongodb://localhost:27017/miBaseDeDatos');
    console.log('  JWT_SECRET=dev-secret-key');
    console.log('  LOG_LEVEL=debug');
    console.log('');
    console.log('🚀 PRODUCCIÓN:');
    console.log('  NODE_ENV=production');
    console.log('  JWT_SECRET=production-secret-key');
    console.log('  SESSION_SECRET=production-session-secret');
    console.log('  SMTP_USER=tu-email@gmail.com');
    console.log('  SMTP_PASS=tu-password-de-aplicacion');
    console.log('  LOG_LEVEL=info');
    console.log('');
    console.log('🧪 TESTING:');
    console.log('  NODE_ENV=test');
    console.log('  MONGO_URI=mongodb://localhost:27017/test-database');
    console.log('  LOG_LEVEL=error');
    console.log('  ENABLE_AUDIT=false');
}

// Ejemplo de patrones de diseño implementados
function ejemploPatronesDiseno() {
    console.log('\n=== Patrones de Diseño Implementados ===\n');

    console.log('🏗️ Patrones utilizados:');
    console.log('');
    console.log('1. 🔧 Singleton Pattern');
    console.log('   - Configuración centralizada');
    console.log('   - Instancias únicas de servicios');
    console.log('');
    console.log('2. 🏭 Factory Pattern');
    console.log('   - Creación de loggers específicos');
    console.log('   - Creación de rate limiters');
    console.log('');
    console.log('3. 🎯 Strategy Pattern');
    console.log('   - Diferentes estrategias de validación');
    console.log('   - Diferentes estrategias de logging');
    console.log('');
    console.log('4. 🔗 Middleware Pattern');
    console.log('   - Middleware de validación');
    console.log('   - Middleware de autorización');
    console.log('   - Middleware de logging');
    console.log('');
    console.log('5. 📚 Repository Pattern');
    console.log('   - Acceso a datos abstracto');
    console.log('   - Separación de lógica de negocio');
    console.log('');
    console.log('6. 📦 DTO Pattern');
    console.log('   - Transferencia de datos estructurada');
    console.log('   - Ocultación de información sensible');
}

// Exportar funciones
module.exports = {
    ejemploArquitecturaProfesional,
    ejemploConfiguracionEntorno,
    ejemploPatronesDiseno
};

// Ejecutar ejemplos si el archivo se ejecuta directamente
if (require.main === module) {
    ejemploArquitecturaProfesional()
        .then(() => {
            ejemploConfiguracionEntorno();
            ejemploPatronesDiseno();
        })
        .catch(console.error);
} 