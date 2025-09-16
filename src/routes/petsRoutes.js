const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');

// GET / - listar mascotas
router.get('/', async (req, res) => {
    try {
        const pets = await Pet.find();
        res.json(pets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

