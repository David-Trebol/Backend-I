const express = require('express');
const router = express.Router();

const { generateMockPets, generateMockUsers } = require('../utils/mocking.utils');
const User = require('../models/User');
let Pet;
try { Pet = require('../models/Pet'); } catch (_) { Pet = null; }

// GET /api/mocks/mockingpets
router.get('/mockingpets', (req, res) => {
    const count = Number(req.query.count) || 50;
    const pets = generateMockPets(count);
    res.json({ count: pets.length, pets });
});

// GET /api/mocks/mockingusers - Genera N usuarios (default 50) con formato Mongo-like
router.get('/mockingusers', (req, res) => {
    const count = Math.max(0, Number(req.query.count) || 50);
    const users = generateMockUsers(count);
    res.json({ count: users.length, users });
});

// POST /api/mocks/generateData - Inserta usuarios y mascotas en la base de datos
router.post('/generateData', async (req, res) => {
    try {
        const usersCount = Math.max(0, Number(req.body.users) || 0);
        const petsCount = Math.max(0, Number(req.body.pets) || 0);

        const usersData = generateMockUsers(usersCount)
            // Mapear rol 'user' a 'customer' para cumplir enum del modelo
            .map(u => ({
                ...u,
                role: u.role === 'user' ? 'customer' : u.role
            }));
        const insertedUsers = usersCount > 0 ? await User.insertMany(usersData) : [];

        let insertedPets = [];
        if (petsCount > 0) {
            if (!Pet) return res.status(500).json({ error: 'Modelo Pet no encontrado. Cree src/models/Pet.js y su ruta GET para verificar.' });
            const petsData = generateMockPets(petsCount);
            insertedPets = await Pet.insertMany(petsData);
        }

        res.status(201).json({
            message: 'Datos generados e insertados correctamente',
            usersInserted: insertedUsers.length,
            petsInserted: insertedPets.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

