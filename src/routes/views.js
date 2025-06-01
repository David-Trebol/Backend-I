const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const CartManager = require('../managers/CartManager');

const productManager = new ProductManager();
const cartManager = new CartManager();

// Vista de productos con paginación
router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {}
        };

        const filter = {};
        if (query) {
            if (query.category) filter.category = query.category;
            if (query.status !== undefined) filter.status = query.status === 'true';
        }

        const result = await productManager.getProducts(filter, options);
        
        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/products`;
        const prevPage = page > 1 ? page - 1 : null;
        const nextPage = page < result.totalPages ? page + 1 : null;
        
        res.render('products/index', {
            ...result,
            prevPage,
            nextPage,
            hasPrevPage: prevPage !== null,
            hasNextPage: nextPage !== null,
            prevLink: prevPage ? `${baseUrl}?page=${prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${JSON.stringify(query)}` : ''}` : null,
            nextLink: nextPage ? `${baseUrl}?page=${nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${JSON.stringify(query)}` : ''}` : null
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

// Vista de detalle de producto
router.get('/products/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        res.render('products/detail', { product });
    } catch (error) {
        res.status(404).render('error', { error: 'Producto no encontrado' });
    }
});

// Vista de carrito
router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await cartManager.getCartById(req.params.cid);
        res.render('carts/detail', { 
            products: cart.products,
            cartId: cart._id
        });
    } catch (error) {
        res.status(404).render('error', { error: 'Carrito no encontrado' });
    }
});

module.exports = router; 