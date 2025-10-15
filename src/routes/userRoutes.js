const express = require('express');
const router = express.Router();
const UserManager = require('../managers/UserManager');

const userManager = new UserManager();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Retorna una lista de usuarios con filtros opcionales y paginación
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número máximo de usuarios por página
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [firstName, lastName, email, age, createdAt]
 *         description: Campo por el cual ordenar los resultados
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, admin]
 *         description: Filtrar por rol del usuario
 *       - in: query
 *         name: minAge
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Edad mínima para filtrar usuarios
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Edad máxima para filtrar usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Error interno del servidor
 */
// GET / - Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const { limit, page, sort, role, minAge, maxAge } = req.query;
        const options = { limit, page, sort };
        
        let users;
        if (role) {
            users = await userManager.getUsersByRole(role);
        } else if (minAge && maxAge) {
            users = await userManager.getUsersByAgeRange(Number(minAge), Number(maxAge));
        } else {
            users = await userManager.getUsers({}, options);
        }
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /admins - Obtener todos los administradores
router.get('/admins', async (req, res) => {
    try {
        const admins = await userManager.getAdmins();
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /:id - Obtener usuario por ID
router.get('/:id', async (req, res) => {
    try {
        const user = await userManager.getUserById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// GET /:id/detail - Obtener usuario con carrito
router.get('/:id/detail', async (req, res) => {
    try {
        const user = await userManager.getUserByIdWithCart(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// GET /email/:email - Obtener usuario por email
router.get('/email/:email', async (req, res) => {
    try {
        const user = await userManager.getUserByEmail(req.params.email);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST / - Crear nuevo usuario
router.post('/', async (req, res) => {
    try {
        const newUser = await userManager.addUser(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /:id - Actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await userManager.updateUser(req.params.id, req.body);
        res.json(updatedUser);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// PATCH /:id/role - Actualizar rol de usuario
router.patch('/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Rol debe ser "user" o "admin"' });
        }
        
        const updatedUser = await userManager.updateUserRole(req.params.id, role);
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PATCH /:id/password - Actualizar contraseña de usuario
router.patch('/:id/password', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: 'Contraseña es requerida' });
        }
        
        const updatedUser = await userManager.updatePassword(req.params.id, password);
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /:id - Eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        await userManager.deleteUser(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// GET /stats/count - Obtener cantidad total de usuarios
router.get('/stats/count', async (req, res) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};
        const count = await userManager.getUsersCount(filter);
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 