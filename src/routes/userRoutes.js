const express = require('express');
const router = express.Router();
const UserManager = require('../managers/UserManager');

const userManager = new UserManager();

// GET / - Listar todos los usuarios
router.get('/', async (req, res) => {
    try {
        const users = await userManager.getUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /:uid - Obtener usuario por ID
router.get('/:uid', async (req, res) => {
    try {
        const user = await userManager.getUserById(req.params.uid);
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

// PUT /:uid - Actualizar usuario
router.put('/:uid', async (req, res) => {
    try {
        const updatedUser = await userManager.updateUser(req.params.uid, req.body);
        res.json(updatedUser);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// DELETE /:uid - Eliminar usuario
router.delete('/:uid', async (req, res) => {
    try {
        await userManager.deleteUser(req.params.uid);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router; 