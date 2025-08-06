const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/jwt.utils');
const UserDTO = require('../dtos/UserDTO');
const { authenticateAndGetUser } = require('../middleware/auth.middleware');

// GET /current - Devuelve los datos del usuario autenticado por JWT (sin información sensible)
router.get('/current', authenticateAndGetUser, (req, res) => {
    try {
        // El middleware ya ha validado el token y agregado el usuario al request
        // El usuario ya está en formato DTO sin información sensible
        res.json({ 
            message: 'Sesión activa',
            user: req.user 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /current/token - Obtener información del token sin consultar base de datos
router.get('/current/token', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const tokenData = verifyToken(token);
        
        // Crear DTO desde token (sin consultar base de datos)
        const userDTO = UserDTO.fromToken(tokenData);
        
        res.json({ 
            message: 'Información del token',
            user: userDTO 
        });
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
});

module.exports = router; 