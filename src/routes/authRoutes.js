const express = require('express');
const router = express.Router();
const UserManager = require('../managers/UserManager');
const { comparePassword } = require('../utils/hash.utils');
const { generateToken, verifyToken } = require('../utils/jwt.utils');

const userManager = new UserManager();

// POST /register - Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const newUser = await userManager.addUser(req.body);
        res.status(201).json({ message: 'Usuario registrado', user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /login - Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userManager.getUserByEmail(email);
        if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
        const valid = comparePassword(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });
        const token = generateToken(user);
        res.json({ message: 'Login exitoso', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /current - Obtener usuario autenticado
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