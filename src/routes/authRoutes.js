const express = require('express');
const router = express.Router();
const UserManager = require('../managers/UserManager');
const { comparePassword } = require('../utils/hash.utils');
const { generateToken, verifyToken } = require('../utils/jwt.utils');
const UserDTO = require('../dtos/UserDTO');
const { authenticateAndGetUser } = require('../middleware/auth.middleware');

const userManager = new UserManager();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro de nuevo usuario
 *     description: Permite registrar un nuevo usuario en el sistema
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado exitosamente"
 *                 user:
 *                   $ref: '#/components/schemas/UserDTO'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Error interno del servidor
 */
// POST /register - Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const newUser = await userManager.addUser(req.body);
        
        // Crear DTO para respuesta sin información sensible
        const userDTO = UserDTO.toProfile(newUser);
        
        res.status(201).json({ 
            message: 'Usuario registrado exitosamente', 
            user: userDTO 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicio de sesión
 *     description: Autentica un usuario y retorna un token JWT
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Credenciales inválidas"
 *       500:
 *         description: Error interno del servidor
 */
// POST /login - Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userManager.getUserByEmail(email);
        
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const valid = comparePassword(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const token = generateToken(user);
        
        // Crear DTO para respuesta sin información sensible
        const userDTO = UserDTO.toAuth(user);
        
        res.json({ 
            message: 'Login exitoso', 
            token,
            user: userDTO 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /current - Obtener usuario autenticado (sin información sensible)
router.get('/current', authenticateAndGetUser, (req, res) => {
    try {
        // El middleware ya ha validado el token y agregado el usuario al request
        // El usuario ya está en formato DTO sin información sensible
        res.json({ 
            message: 'Usuario autenticado',
            user: req.user 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /current/profile - Obtener perfil completo del usuario
router.get('/current/profile', authenticateAndGetUser, (req, res) => {
    try {
        // Obtener usuario completo desde base de datos
        const user = req.user;
        
        // Crear DTO de perfil con información completa pero sin datos sensibles
        const profileDTO = UserDTO.toProfile(user);
        
        res.json({ 
            message: 'Perfil del usuario',
            user: profileDTO 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /current/basic - Obtener información básica del usuario
router.get('/current/basic', authenticateAndGetUser, (req, res) => {
    try {
        // Crear DTO básico con información mínima
        const basicDTO = UserDTO.toBasic(req.user);
        
        res.json({ 
            message: 'Información básica del usuario',
            user: basicDTO 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router; 