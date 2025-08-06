const express = require('express');
const router = express.Router();
const path = require('path');

// Ruta para la página de inicio
router.get('/', (req, res) => {
    res.render('home');
});

// Ruta para la página de productos
router.get('/products', (req, res) => {
    res.render('products/index');
});

// Ruta para la página de detalle de producto
router.get('/products/:id', (req, res) => {
    res.render('products/detail', { productId: req.params.id });
});

// Ruta para la página de carrito
router.get('/carts/current', (req, res) => {
    res.render('carts/detail');
});

// Ruta para productos en tiempo real
router.get('/realtime', (req, res) => {
    res.render('realTimeProducts');
});

// Ruta para recuperación de contraseña
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

// Ruta para restablecer contraseña
router.get('/reset-password', (req, res) => {
    res.render('reset-password');
});

// Ruta para página de error
router.get('/error', (req, res) => {
    res.render('error', { 
        message: req.query.message || 'Ha ocurrido un error',
        error: req.query.error || {}
    });
});

module.exports = router; 