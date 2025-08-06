const fs = require('fs').promises;
const path = require('path');

// Middleware para auditoría de operaciones
const auditLog = (operation, resource) => {
    return async (req, res, next) => {
        const startTime = Date.now();
        const originalSend = res.send;
        const originalJson = res.json;

        // Interceptar la respuesta para capturar el status
        res.send = function(data) {
            logAuditEvent(req, res, operation, resource, startTime, data);
            return originalSend.call(this, data);
        };

        res.json = function(data) {
            logAuditEvent(req, res, operation, resource, startTime, data);
            return originalJson.call(this, data);
        };

        next();
    };
};

// Función para registrar eventos de auditoría
const logAuditEvent = async (req, res, operation, resource, startTime, responseData) => {
    try {
        const endTime = Date.now();
        const duration = endTime - startTime;

        const auditEvent = {
            timestamp: new Date().toISOString(),
            operation: operation,
            resource: resource,
            method: req.method,
            path: req.path,
            params: req.params,
            query: req.query,
            body: sanitizeRequestBody(req.body),
            user: {
                id: req.user?.id,
                email: req.user?.email,
                role: req.user?.role
            },
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            response: sanitizeResponseData(responseData)
        };

        // Guardar en archivo de log
        await writeAuditLog(auditEvent);

        // Log en consola para desarrollo
        console.log('🔍 Auditoría:', {
            operation: auditEvent.operation,
            resource: auditEvent.resource,
            user: auditEvent.user.email,
            role: auditEvent.user.role,
            method: auditEvent.method,
            path: auditEvent.path,
            statusCode: auditEvent.statusCode,
            duration: auditEvent.duration
        });

    } catch (error) {
        console.error('Error en auditoría:', error);
    }
};

// Función para sanitizar datos sensibles del request
const sanitizeRequestBody = (body) => {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key'];

    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
};

// Función para sanitizar datos sensibles de la respuesta
const sanitizeResponseData = (data) => {
    if (!data) return data;

    // Si es string, intentar parsear como JSON
    let responseData = data;
    if (typeof data === 'string') {
        try {
            responseData = JSON.parse(data);
        } catch (e) {
            return '[STRING_RESPONSE]';
        }
    }

    // Si es objeto, sanitizar
    if (typeof responseData === 'object') {
        const sanitized = { ...responseData };
        const sensitiveFields = ['password', 'token', 'secret', 'key'];

        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });

        return sanitized;
    }

    return responseData;
};

// Función para escribir logs de auditoría
const writeAuditLog = async (auditEvent) => {
    try {
        const logDir = path.join(__dirname, '../logs');
        const logFile = path.join(logDir, 'audit.log');

        // Crear directorio de logs si no existe
        try {
            await fs.access(logDir);
        } catch {
            await fs.mkdir(logDir, { recursive: true });
        }

        // Escribir log en formato JSON
        const logEntry = JSON.stringify(auditEvent) + '\n';
        await fs.appendFile(logFile, logEntry);

    } catch (error) {
        console.error('Error escribiendo log de auditoría:', error);
    }
};

// Middleware para registrar intentos de acceso denegado
const logAccessDenied = (req, res, next) => {
    const originalStatus = res.status;
    const originalJson = res.json;

    res.status = function(code) {
        if (code === 401 || code === 403) {
            const accessDeniedEvent = {
                timestamp: new Date().toISOString(),
                type: 'ACCESS_DENIED',
                method: req.method,
                path: req.path,
                statusCode: code,
                user: {
                    id: req.user?.id,
                    email: req.user?.email,
                    role: req.user?.role
                },
                ip: req.ip,
                userAgent: req.get('User-Agent')
            };

            console.log('🚫 Acceso Denegado:', accessDeniedEvent);
            writeAuditLog(accessDeniedEvent);
        }

        return originalStatus.call(this, code);
    };

    res.json = function(data) {
        if (res.statusCode === 401 || res.statusCode === 403) {
            const accessDeniedEvent = {
                timestamp: new Date().toISOString(),
                type: 'ACCESS_DENIED',
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                error: data.error,
                details: data.details,
                user: {
                    id: req.user?.id,
                    email: req.user?.email,
                    role: req.user?.role
                },
                ip: req.ip,
                userAgent: req.get('User-Agent')
            };

            console.log('🚫 Acceso Denegado:', accessDeniedEvent);
            writeAuditLog(accessDeniedEvent);
        }

        return originalJson.call(this, data);
    };

    next();
};

// Middleware para estadísticas de acceso
const accessStats = () => {
    const stats = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        accessDenied: 0,
        byRole: {},
        byResource: {}
    };

    return (req, res, next) => {
        stats.totalRequests++;

        // Contar por rol
        const userRole = req.user?.role || 'anonymous';
        stats.byRole[userRole] = (stats.byRole[userRole] || 0) + 1;

        // Contar por recurso
        const resource = req.path.split('/')[1] || 'root';
        stats.byResource[resource] = (stats.byResource[resource] || 0) + 1;

        // Interceptar respuesta para contar éxitos/fallos
        const originalSend = res.send;
        const originalJson = res.json;

        res.send = function(data) {
            updateStats(res.statusCode);
            return originalSend.call(this, data);
        };

        res.json = function(data) {
            updateStats(res.statusCode);
            return originalJson.call(this, data);
        };

        function updateStats(statusCode) {
            if (statusCode >= 200 && statusCode < 300) {
                stats.successfulRequests++;
            } else if (statusCode === 401 || statusCode === 403) {
                stats.accessDenied++;
            } else {
                stats.failedRequests++;
            }
        }

        // Agregar stats al request para acceso en rutas
        req.accessStats = stats;

        next();
    };
};

// Función para obtener estadísticas de acceso
const getAccessStats = () => {
    return (req, res, next) => {
        if (req.path === '/api/stats/access' && req.method === 'GET') {
            return res.json({
                message: 'Estadísticas de acceso',
                stats: req.accessStats,
                requestedBy: req.user?.email
            });
        }
        next();
    };
};

module.exports = {
    auditLog,
    logAccessDenied,
    accessStats,
    getAccessStats
}; 