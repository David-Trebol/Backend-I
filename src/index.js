const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Importar configuraciones
const config = require('./config/environment.config');
const { log, requestLogger, errorLogger } = require('./utils/logger');
const { errorHandler, notFoundHandler, asyncHandler } = require('./utils/errorHandler');
const { rateLimiters } = require('./middleware/rateLimit.middleware');

// Crear aplicación Express
const app = express();

// Configuración de Handlebars
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Middleware de compresión
app.use(compression());

// Middleware de CORS
app.use(cors({
    origin: config.get('app.corsOrigin'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de logging
app.use(requestLogger);

// Middleware de rate limiting
if (config.get('app.enableRateLimit')) {
    app.use('/api/', rateLimiters.api);
    app.use('/api/auth/', rateLimiters.auth);
    app.use('/api/password-reset/', rateLimiters.passwordReset);
    app.use('/api/products', rateLimiters.products);
    app.use('/api/carts', rateLimiters.carts);
}

// Configuración de sesiones
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
    secret: config.get('app.sessionSecret'),
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: config.get('database.uri'),
        ttl: 24 * 60 * 60, // 1 día
        autoRemove: 'native'
    }),
    cookie: {
        secure: config.get('isProduction'),
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 día
    }
}));

// Configuración de Passport
const passport = require('./config/passport.config');
app.use(passport.initialize());
app.use(passport.session());

// Conexión a MongoDB con manejo de errores
const connectDatabase = async () => {
    try {
        await mongoose.connect(config.get('database.uri'), config.get('database.options'));
        log.info('MongoDB connected successfully', {
            uri: config.get('database.uri'),
            environment: config.get('environment')
        });
    } catch (error) {
        log.error('MongoDB connection failed', {
            error: error.message,
            uri: config.get('database.uri')
        });
        process.exit(1);
    }
};

// Importar rutas
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const viewRoutes = require('./routes/views');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const statsRoutes = require('./routes/statsRoutes');
const petsRoutes = require('./routes/petsRoutes');
const mocksRouter = require('./routes/mocks.router');

// Middleware de validación
const { validateRequest, schemas } = require('./utils/validator');

// Aplicar rutas con validación
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/mocks', mocksRouter);
app.use('/', viewRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.get('environment'),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

// Ruta de información del sistema
app.get('/api/info', (req, res) => {
    res.json({
        name: config.get('email.app.name'),
        version: process.env.npm_package_version || '1.0.0',
        environment: config.get('environment'),
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Middleware para manejo global de errores
app.use(errorHandler);

// Middleware para logging de errores
app.use(errorLogger);

// Función para iniciar el servidor
const startServer = async () => {
    try {
        // Conectar a la base de datos
        await connectDatabase();

        // Iniciar servidor
        const port = config.get('app.port');
        app.listen(port, () => {
            log.info('Server started successfully', {
                port,
                environment: config.get('environment'),
                nodeVersion: process.version,
                timestamp: new Date().toISOString()
            });

            console.log('🚀 Servidor iniciado exitosamente');
            console.log(`📍 Puerto: ${port}`);
            console.log(`🌍 Entorno: ${config.get('environment')}`);
            console.log(`🔐 Sistema de autorización: ACTIVADO`);
            console.log(`📊 Auditoría y logging: HABILITADO`);
            console.log(`⚡ Rate limiting: ${config.get('app.enableRateLimit') ? 'ACTIVADO' : 'DESACTIVADO'}`);
            console.log(`💾 Caché: ${config.get('cache.enabled') ? 'ACTIVADO' : 'DESACTIVADO'}`);
            console.log(`📧 Email: ${config.get('email.auth.user') ? 'CONFIGURADO' : 'NO CONFIGURADO'}`);
        });

    } catch (error) {
        log.error('Failed to start server', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
};

// Manejo de señales de terminación
const gracefulShutdown = (signal) => {
    log.info(`Received ${signal}. Starting graceful shutdown...`);
    
    server.close(() => {
        log.info('HTTP server closed');
        
        mongoose.connection.close(false, () => {
            log.info('MongoDB connection closed');
            process.exit(0);
        });
    });
};

// Escuchar señales de terminación
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    log.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
    });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    log.error('Unhandled Rejection', {
        reason: reason.message || reason,
        stack: reason.stack
    });
    process.exit(1);
});

// Iniciar servidor
startServer();

module.exports = app; 