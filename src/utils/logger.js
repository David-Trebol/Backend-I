const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config/environment.config');

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Formato personalizado para logs
const customFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        
        return log;
    })
);

// Formato para consola
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        
        return log;
    })
);

// Configurar transportes
const transports = [];

// Transporte de consola
if (config.get('logging.console.enabled')) {
    transports.push(
        new winston.transports.Console({
            format: consoleFormat,
            level: config.get('logging.level')
        })
    );
}

// Transporte de archivo
if (config.get('logging.file.enabled')) {
    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, 'app.log'),
            format: customFormat,
            level: config.get('logging.level'),
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
            tailable: true
        })
    );

    // Archivo separado para errores
    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            format: customFormat,
            level: 'error',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
            tailable: true
        })
    );
}

// Crear logger
const logger = winston.createLogger({
    level: config.get('logging.level'),
    format: customFormat,
    transports,
    exitOnError: false
});

// Logger específico para auditoría
const auditLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'audit.log'),
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 10,
            tailable: true
        })
    ]
});

// Logger específico para seguridad
const securityLogger = winston.createLogger({
    level: 'warn',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'security.log'),
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 10,
            tailable: true
        })
    ]
});

// Logger específico para performance
const performanceLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'performance.log'),
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
            tailable: true
        })
    ]
});

// Métodos de conveniencia
const log = {
    info: (message, meta = {}) => logger.info(message, meta),
    error: (message, meta = {}) => logger.error(message, meta),
    warn: (message, meta = {}) => logger.warn(message, meta),
    debug: (message, meta = {}) => logger.debug(message, meta),
    verbose: (message, meta = {}) => logger.verbose(message, meta),
    
    // Auditoría
    audit: (event, data = {}) => {
        auditLogger.info('AUDIT', {
            event,
            timestamp: new Date().toISOString(),
            ...data
        });
    },
    
    // Seguridad
    security: (event, data = {}) => {
        securityLogger.warn('SECURITY', {
            event,
            timestamp: new Date().toISOString(),
            ...data
        });
    },
    
    // Performance
    performance: (operation, duration, data = {}) => {
        performanceLogger.info('PERFORMANCE', {
            operation,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            ...data
        });
    },
    
    // HTTP requests
    http: (req, res, duration) => {
        const logData = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            userId: req.user?.id,
            userEmail: req.user?.email
        };
        
        if (res.statusCode >= 400) {
            logger.error('HTTP Request Error', logData);
        } else {
            logger.info('HTTP Request', logData);
        }
    },
    
    // Database operations
    db: (operation, collection, duration, data = {}) => {
        logger.debug('Database Operation', {
            operation,
            collection,
            duration: `${duration}ms`,
            ...data
        });
    },
    
    // Email operations
    email: (operation, recipient, template, success, error = null) => {
        const logData = {
            operation,
            recipient,
            template,
            success,
            timestamp: new Date().toISOString()
        };
        
        if (error) {
            logData.error = error.message;
            logger.error('Email Operation Failed', logData);
        } else {
            logger.info('Email Operation Success', logData);
        }
    },
    
    // Business logic
    business: (operation, entity, action, data = {}) => {
        logger.info('Business Logic', {
            operation,
            entity,
            action,
            timestamp: new Date().toISOString(),
            ...data
        });
    }
};

// Middleware para logging de requests
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log al inicio del request
    log.info('Request Started', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    
    // Interceptar el final del response
    res.on('finish', () => {
        const duration = Date.now() - start;
        log.http(req, res, duration);
    });
    
    next();
};

// Middleware para logging de errores
const errorLogger = (err, req, res, next) => {
    log.error('Unhandled Error', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id
    });
    
    next(err);
};

// Función para limpiar logs antiguos
const cleanupLogs = async () => {
    try {
        const logFiles = [
            'app.log',
            'error.log',
            'audit.log',
            'security.log',
            'performance.log'
        ];
        
        for (const file of logFiles) {
            const filePath = path.join(logDir, file);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                const fileSizeInMB = stats.size / (1024 * 1024);
                
                if (fileSizeInMB > 50) { // 50MB
                    log.warn('Log file size exceeded limit', {
                        file,
                        size: `${fileSizeInMB.toFixed(2)}MB`
                    });
                }
            }
        }
    } catch (error) {
        log.error('Error cleaning up logs', { error: error.message });
    }
};

// Programar limpieza de logs cada hora
setInterval(cleanupLogs, 60 * 60 * 1000);

module.exports = {
    log,
    requestLogger,
    errorLogger,
    cleanupLogs,
    auditLogger,
    securityLogger,
    performanceLogger
}; 