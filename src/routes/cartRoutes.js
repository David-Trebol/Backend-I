const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');

const cartManager = new CartManager();

// Obtener todos los carritos
router.get('/', async (req, res) => {
    try {
        const carts = await cartManager.getCarts();
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un carrito por ID
router.get('/:id', async (req, res) => {
    try {
        const cart = await cartManager.getCartById(req.params.id);
        res.json(cart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Agregar un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.addCart(req.body);
        res.status(201).json(newCart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Actualizar un carrito
router.put('/:id', async (req, res) => {
    try {
        const updatedCart = await cartManager.updateCart(req.params.id, req.body);
        res.json(updatedCart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Eliminar un carrito
router.delete('/:id', async (req, res) => {
    try {
        await cartManager.deleteCart(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Eliminar un producto específico del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        await cartManager.removeProductFromCart(cid, pid);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Actualizar todos los productos del carrito
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;
        const updatedCart = await cartManager.updateCartProducts(cid, products);
        res.json(updatedCart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Actualizar cantidad de un producto específico
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
        res.json(updatedCart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        await cartManager.clearCart(cid);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router; 