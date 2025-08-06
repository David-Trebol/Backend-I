const express = require('express');
const router = express.Router();
const UserManager = require('../managers/UserManager');

const userManager = new UserManager();

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