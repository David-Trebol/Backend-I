const { log } = require('./logger');
const config = require('../config/environment.config');

// Clases de error personalizadas
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, details = []) {
        super(message, 400);
        this.details = details;
        this.type = 'ValidationError';
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'No autenticado') {
        super(message, 401);
        this.type = 'AuthenticationError';
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Acceso denegado') {
        super(message, 403);
        this.type = 'AuthorizationError';
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Recurso') {
        super(`${resource} no encontrado`, 404);
        this.type = 'NotFoundError';
    }
}

class ConflictError extends AppError {
    constructor(message = 'Conflicto de datos') {
        super(message, 409);
        this.type = 'ConflictError';
    }
}

class RateLimitError extends AppError {
    constructor(message = 'Demasiadas solicitudes') {
        super(message, 429);
        this.type = 'RateLimitError';
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Error de base de datos', isOperational = false) {
        super(message, 500, isOperational);
        this.type = 'DatabaseError';
    }
}

class EmailError extends AppError {
    constructor(message = 'Error enviando email') {
        super(message, 500);
        this.type = 'EmailError';
    }
}

// Función para crear errores operacionales
const createOperationalError = (message, statusCode) => {
    return new AppError(message, statusCode, true);
};

// Función para crear errores de programación
const createProgrammingError = (message, statusCode = 500) => {
    return new AppError(message, statusCode, false);
};

// Función para manejar errores de MongoDB
const handleMongoError = (error) => {
    if (error.name === 'ValidationError') {
        const details = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
        }));
        return new ValidationError('Error de validación de datos', details);
    }
    
    if (error.name === 'CastError') {
        return new ValidationError('ID inválido');
    }
    
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return new ConflictError(`${field} ya existe`);
    }
    
    return new DatabaseError('Error de base de datos', false);
};

// Función para manejar errores de JWT
const handleJWTError = (error) => {
    if (error.name === 'JsonWebTokenError') {
        return new AuthenticationError('Token inválido');
    }
    
    if (error.name === 'TokenExpiredError') {
        return new AuthenticationError('Token expirado');
    }
    
    return new AuthenticationError('Error de autenticación');
};

// Función para manejar errores de validación
const handleValidationError = (error) => {
    const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
    }));
    
    return new ValidationError('Datos de entrada inválidos', details);
};

// Middleware para manejo global de errores
const errorHandler = (err, req, res, next) => {
    let error = err;
    
    // Log del error
    log.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
    });

    // Manejar errores específicos
    if (err.name === 'ValidationError') {
        error = handleValidationError(err);
    } else if (err.name === 'CastError' || err.name === 'MongoError') {
        error = handleMongoError(err);
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        error = handleJWTError(err);
    } else if (!err.isOperational) {
        // Errores de programación
        error = createProgrammingError('Error interno del servidor');
    }

    // Preparar respuesta de error
    const errorResponse = {
        error: {
            message: error.message,
            type: error.type || 'AppError',
            statusCode: error.statusCode || 500,
            timestamp: error.timestamp || new Date().toISOString()
        }
    };

    // Agregar detalles en desarrollo
    if (config.get('isDevelopment')) {
        errorResponse.error.stack = error.stack;
        errorResponse.error.details = error.details || [];
    }

    // Agregar detalles de validación si existen
    if (error.details && Array.isArray(error.details)) {
        errorResponse.error.details = error.details;
    }

    // Log de error procesado
    log.error('Error processed', {
        type: errorResponse.error.type,
        statusCode: errorResponse.error.statusCode,
        message: errorResponse.error.message,
        url: req.url,
        method: req.method
    });

    // Enviar respuesta
    res.status(error.statusCode || 500).json(errorResponse);
};

// Middleware para manejar rutas no encontradas
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError('Ruta');
    next(error);
};

// Middleware para manejar errores asíncronos
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Función para manejar errores en promesas
const handleUnhandledRejection = (reason, promise) => {
    log.error('Unhandled Rejection', {
        reason: reason.message || reason,
        stack: reason.stack,
        promise: promise
    });
    
    // En producción, cerrar el proceso
    if (config.get('isProduction')) {
        process.exit(1);
    }
};

// Función para manejar errores no capturados
const handleUncaughtException = (error) => {
    log.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
    });
    
    // En producción, cerrar el proceso
    if (config.get('isProduction')) {
        process.exit(1);
    }
};

// Función para validar y sanitizar errores
const sanitizeError = (error) => {
    // Remover información sensible en producción
    if (config.get('isProduction')) {
        delete error.stack;
        delete error.details;
    }
    
    return error;
};

// Función para crear respuestas de error consistentes
const createErrorResponse = (error, req) => {
    const response = {
        error: {
            message: error.message,
            type: error.type || 'AppError',
            statusCode: error.statusCode || 500,
            timestamp: error.timestamp || new Date().toISOString(),
            path: req.url,
            method: req.method
        }
    };

    // Agregar detalles en desarrollo
    if (config.get('isDevelopment')) {
        response.error.stack = error.stack;
        if (error.details) {
            response.error.details = error.details;
        }
    }

    return response;
};

// Función para manejar errores de rate limiting
const handleRateLimitError = (req, res, next) => {
    const error = new RateLimitError();
    next(error);
};

// Función para manejar errores de timeout
const handleTimeoutError = (req, res, next) => {
    const error = new AppError('Tiempo de espera agotado', 408);
    next(error);
};

// Configurar manejadores globales
process.on('unhandledRejection', handleUnhandledRejection);
process.on('uncaughtException', handleUncaughtException);

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    DatabaseError,
    EmailError,
    createOperationalError,
    createProgrammingError,
    handleMongoError,
    handleJWTError,
    handleValidationError,
    errorHandler,
    notFoundHandler,
    asyncHandler,
    sanitizeError,
    createErrorResponse,
    handleRateLimitError,
    handleTimeoutError
}; 