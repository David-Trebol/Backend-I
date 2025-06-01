const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');

const productManager = new ProductManager();

// Obtener todos los productos con filtros, paginación y ordenamiento
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {}
        };

        // Construir el filtro basado en el query
        const filter = {};
        if (query) {
            if (query.category) {
                filter.category = query.category;
            }
            if (query.status !== undefined) {
                filter.status = query.status === 'true';
            }
        }

        const result = await productManager.getProducts(filter, options);
        
        // Construir los links de paginación
        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
        const prevPage = page > 1 ? page - 1 : null;
        const nextPage = page < result.totalPages ? page + 1 : null;
        
        const response = {
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage,
            nextPage,
            page: parseInt(page),
            hasPrevPage: prevPage !== null,
            hasNextPage: nextPage !== null,
            prevLink: prevPage ? `${baseUrl}?page=${prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${JSON.stringify(query)}` : ''}` : null,
            nextLink: nextPage ? `${baseUrl}?page=${nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${JSON.stringify(query)}` : ''}` : null
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: error.message 
        });
    }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.id);
        res.json(product);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Agregar un nuevo producto
router.post('/', async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Actualizar un producto
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await productManager.updateProduct(req.params.id, req.body);
        res.json(updatedProduct);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
    try {
        await productManager.deleteProduct(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router; 