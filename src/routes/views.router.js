const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');

const productManager = new ProductManager();

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', {
            products,
            title: 'Lista de Productos'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('realTimeProducts', { 
            products,
            title: 'Productos en Tiempo Real'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 