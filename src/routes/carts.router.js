const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');
const { authorizeCart, authorizeResourceOwnership, checkPermission } = require('../middleware/authorization.middleware');

const cartManager = new CartManager();

// POST / - Crear nuevo carrito (solo usuarios autenticados)
router.post('/', authorizeCart('add'), async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json({
            message: 'Carrito creado exitosamente',
            cart: newCart,
            createdBy: req.user.email
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET / - Obtener todos los carritos (solo admin)
router.get('/', authorizeCart('admin'), async (req, res) => {
    try {
        const carts = await cartManager.getCarts();
        res.json({
            message: 'Lista de carritos obtenida',
            carts: carts,
            requestedBy: req.user.email
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /:cid - Obtener carrito por ID (verificar propiedad)
router.get('/:cid', authorizeCart('view'), authorizeResourceOwnership('cart'), async (req, res) => {
    try {
        const cart = await cartManager.getCartById(req.params.cid);
        res.json({
            message: 'Carrito obtenido exitosamente',
            cart: cart,
            requestedBy: req.user.email
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// GET /:cid/detail - Obtener carrito con productos populados (verificar propiedad)
router.get('/:cid/detail', authorizeCart('view'), authorizeResourceOwnership('cart'), async (req, res) => {
    try {
        const cart = await cartManager.getCartByIdWithProducts(req.params.cid);
        res.json({
            message: 'Detalle del carrito obtenido',
            cart: cart,
            requestedBy: req.user.email
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST /:cid/product/:pid - Agregar producto al carrito (verificar propiedad)
router.post('/:cid/product/:pid', authorizeCart('add'), authorizeResourceOwnership('cart'), async (req, res) => {
    try {
        const { quantity = 1 } = req.body;
        const updatedCart = await cartManager.addProductToCart(req.params.cid, req.params.pid, quantity);
        res.json({
            message: 'Producto agregado al carrito exitosamente',
            cart: updatedCart,
            addedBy: req.user.email,
            productId: req.params.pid,
            quantity: quantity
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// DELETE /:cid/product/:pid - Remover producto del carrito (verificar propiedad)
router.delete('/:cid/product/:pid', authorizeCart('remove'), authorizeResourceOwnership('cart'), async (req, res) => {
    try {
        const updatedCart = await cartManager.removeProductFromCart(req.params.cid, req.params.pid);
        res.json({
            message: 'Producto removido del carrito exitosamente',
            cart: updatedCart,
            removedBy: req.user.email,
            productId: req.params.pid
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// PUT /:cid/product/:pid - Actualizar cantidad de producto en carrito (verificar propiedad)
router.put('/:cid/product/:pid', authorizeCart('update'), authorizeResourceOwnership('cart'), async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || quantity < 0) {
            return res.status(400).json({ error: 'Cantidad debe ser un número positivo' });
        }
        
        const updatedCart = await cartManager.updateProductQuantity(req.params.cid, req.params.pid, quantity);
        res.json({
            message: 'Cantidad de producto actualizada exitosamente',
            cart: updatedCart,
            updatedBy: req.user.email,
            productId: req.params.pid,
            newQuantity: quantity
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /:cid - Vaciar carrito (verificar propiedad)
router.delete('/:cid', authorizeCart('update'), authorizeResourceOwnership('cart'), async (req, res) => {
    try {
        const updatedCart = await cartManager.clearCart(req.params.cid);
        res.json({
            message: 'Carrito vaciado exitosamente',
            cart: updatedCart,
            clearedBy: req.user.email
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// GET /:cid/total - Obtener total del carrito (verificar propiedad)
router.get('/:cid/total', authorizeCart('view'), authorizeResourceOwnership('cart'), async (req, res) => {
    try {
        const total = await cartManager.getCartTotal(req.params.cid);
        res.json({
            message: 'Total del carrito calculado',
            total: total,
            requestedBy: req.user.email
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// GET /:cid/count - Obtener cantidad de items en carrito (verificar propiedad)
router.get('/:cid/count', authorizeCart('view'), authorizeResourceOwnership('cart'), async (req, res) => {
    try {
        const count = await cartManager.getCartItemCount(req.params.cid);
        res.json({
            message: 'Cantidad de items calculada',
            count: count,
            requestedBy: req.user.email
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// GET /current - Obtener carrito del usuario actual
router.get('/current', authorizeCart('view'), async (req, res) => {
    try {
        // Obtener el carrito del usuario actual
        const UserManager = require('../managers/UserManager');
        const userManager = new UserManager();
        const user = await userManager.getUserById(req.user.id);
        
        if (!user || !user.cart) {
            return res.status(404).json({ error: 'Usuario no tiene carrito asignado' });
        }

        const cart = await cartManager.getCartByIdWithProducts(user.cart);
        res.json({
            message: 'Carrito actual obtenido',
            cart: cart,
            requestedBy: req.user.email
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST /current/product/:pid - Agregar producto al carrito actual
router.post('/current/product/:pid', authorizeCart('add'), async (req, res) => {
    try {
        // Obtener el carrito del usuario actual
        const UserManager = require('../managers/UserManager');
        const userManager = new UserManager();
        const user = await userManager.getUserById(req.user.id);
        
        if (!user || !user.cart) {
            return res.status(404).json({ error: 'Usuario no tiene carrito asignado' });
        }

        const { quantity = 1 } = req.body;
        const updatedCart = await cartManager.addProductToCart(user.cart, req.params.pid, quantity);
        res.json({
            message: 'Producto agregado al carrito actual exitosamente',
            cart: updatedCart,
            addedBy: req.user.email,
            productId: req.params.pid,
            quantity: quantity
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// DELETE /current/product/:pid - Remover producto del carrito actual
router.delete('/current/product/:pid', authorizeCart('remove'), async (req, res) => {
    try {
        // Obtener el carrito del usuario actual
        const UserManager = require('../managers/UserManager');
        const userManager = new UserManager();
        const user = await userManager.getUserById(req.user.id);
        
        if (!user || !user.cart) {
            return res.status(404).json({ error: 'Usuario no tiene carrito asignado' });
        }

        const updatedCart = await cartManager.removeProductFromCart(user.cart, req.params.pid);
        res.json({
            message: 'Producto removido del carrito actual exitosamente',
            cart: updatedCart,
            removedBy: req.user.email,
            productId: req.params.pid
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router; 