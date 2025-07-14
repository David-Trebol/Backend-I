const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/jwt.utils');

// GET /current - Devuelve los datos del usuario autenticado por JWT
router.get('/current', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Token no proporcionado' });
        const token = authHeader.split(' ')[1];
        const user = verifyToken(token);
        res.json({ user });
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
});

module.exports = router; 