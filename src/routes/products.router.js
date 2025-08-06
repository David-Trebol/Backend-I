const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const { authorizeProduct, checkPermission } = require('../middleware/authorization.middleware');

const productManager = new ProductManager();

// GET / - Listar todos los productos (lectura pública)
router.get('/', async (req, res) => {
    try {
        const { limit, page, sort, category, minPrice, maxPrice, inStock } = req.query;
        const options = { limit, page, sort };
        
        let products;
        if (category) {
            products = await productManager.getProductsByCategory(category, options);
        } else if (minPrice && maxPrice) {
            products = await productManager.getProductsByPriceRange(Number(minPrice), Number(maxPrice), options);
        } else if (inStock === 'true') {
            products = await productManager.getProductsInStock(options);
        } else {
            products = await productManager.getProducts({}, options);
        }
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /:pid - Obtener producto por ID (lectura pública)
router.get('/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        res.json(product);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// GET /code/:code - Obtener producto por código (lectura pública)
router.get('/code/:code', async (req, res) => {
    try {
        const product = await productManager.getProductByCode(req.params.code);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(product);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST / - Crear nuevo producto (solo admin)
router.post('/', authorizeProduct('create'), async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body);
        res.status(201).json({
            message: 'Producto creado exitosamente',
            product: newProduct,
            createdBy: req.user.email
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /:pid - Actualizar producto (solo admin)
router.put('/:pid', authorizeProduct('update'), async (req, res) => {
    try {
        const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
        res.json({
            message: 'Producto actualizado exitosamente',
            product: updatedProduct,
            updatedBy: req.user.email
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// PATCH /:pid/stock - Actualizar stock de producto (solo admin)
router.patch('/:pid/stock', authorizeProduct('update'), async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || typeof quantity !== 'number') {
            return res.status(400).json({ error: 'Cantidad es requerida y debe ser un número' });
        }
        
        const updatedProduct = await productManager.updateProductStock(req.params.pid, quantity);
        res.json({
            message: 'Stock actualizado exitosamente',
            product: updatedProduct,
            updatedBy: req.user.email
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /:pid - Eliminar producto (solo admin)
router.delete('/:pid', authorizeProduct('delete'), async (req, res) => {
    try {
        await productManager.deleteProduct(req.params.pid);
        res.status(204).json({
            message: 'Producto eliminado exitosamente',
            deletedBy: req.user.email
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// GET /stats/count - Obtener cantidad total de productos (lectura pública)
router.get('/stats/count', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};
        const count = await productManager.getProductsCount(filter);
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /admin/stats - Estadísticas detalladas (solo admin)
router.get('/admin/stats', checkPermission('products.read'), async (req, res) => {
    try {
        const totalProducts = await productManager.getProductsCount();
        const productsInStock = await productManager.getProductsInStock();
        const productsOutOfStock = await productManager.getProducts({ stock: 0 });
        
        res.json({
            totalProducts: totalProducts,
            productsInStock: productsInStock.length,
            productsOutOfStock: productsOutOfStock.length,
            requestedBy: req.user.email
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 