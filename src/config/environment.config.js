const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Configuración de entorno
const environment = process.env.NODE_ENV || 'development';

// Configuraciones por entorno
const configs = {
    development: {
        port: process.env.PORT || 3000,
        mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/miBaseDeDatos',
        jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
        sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        logLevel: process.env.LOG_LEVEL || 'debug',
        enableAudit: process.env.ENABLE_AUDIT !== 'false',
        enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false'
    },
    production: {
        port: process.env.PORT || 3000,
        mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/miBaseDeDatos',
        jwtSecret: process.env.JWT_SECRET,
        sessionSecret: process.env.SESSION_SECRET,
        corsOrigin: process.env.CORS_ORIGIN || 'https://miapp.com',
        logLevel: process.env.LOG_LEVEL || 'info',
        enableAudit: process.env.ENABLE_AUDIT !== 'false',
        enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false'
    },
    test: {
        port: process.env.PORT || 3001,
        mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/test-database',
        jwtSecret: process.env.JWT_SECRET || 'test-secret-key',
        sessionSecret: process.env.SESSION_SECRET || 'test-session-secret',
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
        logLevel: process.env.LOG_LEVEL || 'error',
        enableAudit: false,
        enableRateLimit: false
    }
};

// Configuración de email
const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    app: {
        name: process.env.APP_NAME || 'Mi Aplicación',
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
        email: process.env.APP_EMAIL || 'noreply@miapp.com'
    }
};

// Configuración de seguridad
const securityConfig = {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    passwordResetExpiration: parseInt(process.env.PASSWORD_RESET_EXPIRATION) || 3600, // 1 hora
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 900, // 15 minutos
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutos
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100
};

// Configuración de logging
const loggingConfig = {
    level: configs[environment].logLevel,
    format: process.env.LOG_FORMAT || 'json',
    file: {
        enabled: process.env.LOG_FILE_ENABLED !== 'false',
        path: process.env.LOG_FILE_PATH || 'logs/app.log',
        maxSize: process.env.LOG_FILE_MAX_SIZE || '10m',
        maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES) || 5
    },
    console: {
        enabled: process.env.LOG_CONSOLE_ENABLED !== 'false',
        colorize: process.env.LOG_CONSOLE_COLORIZE !== 'false'
    }
};

// Configuración de base de datos
const databaseConfig = {
    uri: configs[environment].mongoUri,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
        serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000,
        socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
        bufferMaxEntries: parseInt(process.env.DB_BUFFER_MAX_ENTRIES) || 0
    }
};

// Configuración de caché
const cacheConfig = {
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutos
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 100,
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD) || 600
};

// Configuración de validación
const validationConfig = {
    password: {
        minLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 6,
        requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
        requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
        requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
        requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL_CHARS !== 'false'
    },
    email: {
        requireVerification: process.env.EMAIL_REQUIRE_VERIFICATION !== 'false',
        verificationExpiration: parseInt(process.env.EMAIL_VERIFICATION_EXPIRATION) || 86400 // 24 horas
    }
};

// Función para validar configuración
const validateConfig = () => {
    const errors = [];

    if (!configs[environment].jwtSecret && environment === 'production') {
        errors.push('JWT_SECRET is required in production');
    }

    if (!configs[environment].sessionSecret && environment === 'production') {
        errors.push('SESSION_SECRET is required in production');
    }

    if (!emailConfig.auth.user && environment === 'production') {
        errors.push('SMTP_USER is required in production');
    }

    if (!emailConfig.auth.pass && environment === 'production') {
        errors.push('SMTP_PASS is required in production');
    }

    if (errors.length > 0) {
        throw new Error(`Configuration errors: ${errors.join(', ')}`);
    }
};

// Función para obtener configuración
const getConfig = () => {
    validateConfig();
    
    return {
        environment,
        app: configs[environment],
        email: emailConfig,
        security: securityConfig,
        logging: loggingConfig,
        database: databaseConfig,
        cache: cacheConfig,
        validation: validationConfig,
        isDevelopment: environment === 'development',
        isProduction: environment === 'production',
        isTest: environment === 'test'
    };
};

// Función para obtener configuración específica
const get = (key) => {
    const config = getConfig();
    return key.split('.').reduce((obj, k) => obj && obj[k], config);
};

module.exports = {
    getConfig,
    get,
    validateConfig,
    environment
}; 