const express = require('express');
const router = express.Router();
const { checkPermission } = require('../middleware/authorization.middleware');
const { getAccessStats } = require('../middleware/audit.middleware');

// GET /access - Estadísticas de acceso (solo admin)
router.get('/access', checkPermission('users.read'), getAccessStats(), (req, res) => {
    res.json({
        message: 'Estadísticas de acceso',
        stats: req.accessStats,
        requestedBy: req.user.email
    });
});

// GET /authorization - Estadísticas de autorización (solo admin)
router.get('/authorization', checkPermission('users.read'), async (req, res) => {
    try {
        // Simular estadísticas de autorización
        const authStats = {
            totalRequests: req.accessStats?.totalRequests || 0,
            successfulAuth: req.accessStats?.successfulRequests || 0,
            failedAuth: req.accessStats?.failedRequests || 0,
            accessDenied: req.accessStats?.accessDenied || 0,
            byRole: req.accessStats?.byRole || {},
            byResource: req.accessStats?.byResource || {},
            permissions: {
                'products.create': { allowedRoles: ['admin'], totalAttempts: 0, successful: 0, denied: 0 },
                'products.update': { allowedRoles: ['admin'], totalAttempts: 0, successful: 0, denied: 0 },
                'products.delete': { allowedRoles: ['admin'], totalAttempts: 0, successful: 0, denied: 0 },
                'cart.add': { allowedRoles: ['user', 'admin'], totalAttempts: 0, successful: 0, denied: 0 },
                'cart.remove': { allowedRoles: ['user', 'admin'], totalAttempts: 0, successful: 0, denied: 0 },
                'cart.view': { allowedRoles: ['user', 'admin'], totalAttempts: 0, successful: 0, denied: 0 }
            }
        };

        res.json({
            message: 'Estadísticas de autorización',
            stats: authStats,
            requestedBy: req.user.email
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /audit - Logs de auditoría (solo admin)
router.get('/audit', checkPermission('users.read'), async (req, res) => {
    try {
        const fs = require('fs').promises;
        const path = require('path');
        const logFile = path.join(__dirname, '../logs/audit.log');

        let auditLogs = [];
        try {
            const logContent = await fs.readFile(logFile, 'utf-8');
            const lines = logContent.trim().split('\n');
            
            // Obtener los últimos 100 logs
            const recentLogs = lines.slice(-100);
            
            auditLogs = recentLogs.map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return null;
                }
            }).filter(log => log !== null);

        } catch (error) {
            // Si no existe el archivo, retornar array vacío
            auditLogs = [];
        }

        res.json({
            message: 'Logs de auditoría',
            totalLogs: auditLogs.length,
            logs: auditLogs.slice(-20), // Solo los últimos 20 logs
            requestedBy: req.user.email
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /security - Reporte de seguridad (solo admin)
router.get('/security', checkPermission('users.read'), async (req, res) => {
    try {
        const securityReport = {
            timestamp: new Date().toISOString(),
            totalAccessDenied: req.accessStats?.accessDenied || 0,
            suspiciousActivity: [],
            recommendations: [
                'Revisar logs de acceso denegado regularmente',
                'Monitorear intentos de acceso a recursos restringidos',
                'Verificar permisos de usuarios periódicamente',
                'Implementar rate limiting para endpoints sensibles'
            ],
            lastUpdated: new Date().toISOString()
        };

        res.json({
            message: 'Reporte de seguridad',
            report: securityReport,
            requestedBy: req.user.email
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 