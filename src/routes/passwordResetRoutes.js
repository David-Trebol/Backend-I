const express = require('express');
const router = express.Router();
const PasswordResetService = require('../services/passwordResetService');

const passwordResetService = new PasswordResetService();

// POST /request - Solicitar recuperación de contraseña
router.post('/request', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                error: 'El email es requerido' 
            });
        }

        const result = await passwordResetService.requestPasswordReset(email);
        
        res.json({
            success: true,
            message: result.message,
            expiresIn: result.expiresIn
        });

    } catch (error) {
        console.error('Error en solicitud de recuperación:', error);
        res.status(400).json({ 
            error: error.message 
        });
    }
});

// GET /verify/:token - Verificar token de recuperación
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json({ 
                error: 'Token es requerido' 
            });
        }

        const result = await passwordResetService.verifyResetToken(token);
        
        res.json({
            success: true,
            valid: result.valid,
            user: result.user,
            expiresAt: result.expiresAt
        });

    } catch (error) {
        console.error('Error verificando token:', error);
        res.status(400).json({ 
            error: error.message 
        });
    }
});

// POST /reset - Restablecer contraseña
router.post('/reset', async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;
        
        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({ 
                error: 'Token, nueva contraseña y confirmación son requeridos' 
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                error: 'Las contraseñas no coinciden' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                error: 'La contraseña debe tener al menos 6 caracteres' 
            });
        }

        const result = await passwordResetService.resetPassword(token, newPassword);
        
        res.json({
            success: true,
            message: result.message
        });

    } catch (error) {
        console.error('Error restableciendo contraseña:', error);
        res.status(400).json({ 
            error: error.message 
        });
    }
});

// POST /cancel - Cancelar solicitud de recuperación
router.post('/cancel', async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ 
                error: 'Token es requerido' 
            });
        }

        const result = await passwordResetService.cancelPasswordReset(token);
        
        res.json({
            success: true,
            message: result.message
        });

    } catch (error) {
        console.error('Error cancelando recuperación:', error);
        res.status(400).json({ 
            error: error.message 
        });
    }
});

// GET /stats - Obtener estadísticas de tokens (solo admin)
router.get('/stats', async (req, res) => {
    try {
        const stats = await passwordResetService.getTokenStats();
        
        res.json({
            success: true,
            stats: stats
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
});

// POST /cleanup - Limpiar tokens expirados (solo admin)
router.post('/cleanup', async (req, res) => {
    try {
        const deletedCount = await passwordResetService.cleanupExpiredTokens();
        
        res.json({
            success: true,
            message: `Se eliminaron ${deletedCount} tokens expirados`,
            deletedCount: deletedCount
        });

    } catch (error) {
        console.error('Error limpiando tokens:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
});

module.exports = router; 