const request = require('supertest');
const express = require('express');
const productRoutes = require('../../src/routes/productRoutes');

// Mock dependencies
jest.mock('../../src/managers/ProductManager');

const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Product Routes', () => {
  const mockProduct = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Product',
    price: 100,
    category: 'electronics',
    stock: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should get products with default pagination', async () => {
      const ProductManager = require('../../src/managers/ProductManager');
      ProductManager.prototype.getProducts = jest.fn().mockResolvedValue({
        docs: [mockProduct],
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      });

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.payload).toHaveLength(1);
      expect(response.body.totalPages).toBe(1);
    });

    it('should get products with query parameters', async () => {
      const ProductManager = require('../../src/managers/ProductManager');
      ProductManager.prototype.getProducts = jest.fn().mockResolvedValue({
        docs: [mockProduct],
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      });

      const response = await request(app)
        .get('/api/products?limit=5&page=2&sort=asc')
        .expect(200);

      expect(ProductManager.prototype.getProducts).toHaveBeenCalledWith(
        {},
        { limit: 5, page: 2, sort: { price: 1 } }
      );
    });

    it('should handle errors when getting products', async () => {
      const ProductManager = require('../../src/managers/ProductManager');
      ProductManager.prototype.getProducts = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/products')
        .expect(500);

      expect(response.body.status).toBe('error');
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product by ID', async () => {
      const ProductManager = require('../../src/managers/ProductManager');
      ProductManager.prototype.getProductById = jest.fn().mockResolvedValue(mockProduct);

      const response = await request(app)
        .get('/api/products/507f1f77bcf86cd799439011')
        .expect(200);

      expect(response.body).toEqual(mockProduct);
      expect(ProductManager.prototype.getProductById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return 404 for non-existent product', async () => {
      const ProductManager = require('../../src/managers/ProductManager');
      ProductManager.prototype.getProductById = jest.fn().mockRejectedValue(new Error('Producto no encontrado'));

      const response = await request(app)
        .get('/api/products/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Producto no encontrado');
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const ProductManager = require('../../src/managers/ProductManager');
      ProductManager.prototype.addProduct = jest.fn().mockResolvedValue(mockProduct);

      const productData = {
        name: 'New Product',
        price: 150,
        category: 'electronics'
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      expect(response.body).toEqual(mockProduct);
      expect(ProductManager.prototype.addProduct).toHaveBeenCalledWith(productData);
    });

    it('should handle errors when creating product', async () => {
      const ProductManager = require('../../src/managers/ProductManager');
      ProductManager.prototype.addProduct = jest.fn().mockRejectedValue(new Error('Validation error'));

      const productData = {
        name: 'Invalid Product'
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(400);

      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update an existing product', async () => {
      const ProductManager = require('../../src/managers/ProductManager');
      const updatedProduct = { ...mockProduct, name: 'Updated Product' };
      ProductManager.prototype.updateProduct = jest.fn().mockResolvedValue(updatedProduct);

      const updateData = { name: 'Updated Product' };

      const response = await request(app)
        .put('/api/products/507f1f77bcf86cd799439011')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedProduct);
      expect(ProductManager.prototype.updateProduct).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateData);
    });

    it('should return 404 when updating non-existent product', async () => {
      const ProductManager = require('../../src/managers/ProductManager');
      ProductManager.prototype.updateProduct = jest.fn().mockRejectedValue(new Error('Producto no encontrado'));

      const updateData = { name: 'Updated Product' };

      const response = await request(app)
        .put('/api/products/nonexistent')
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Producto no encontrado');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete an existing product', async () => {
      const ProductManager = require('../../src/managers/ProductManager');
      ProductManager.prototype.deleteProduct = jest.fn().mockResolvedValue();

      await request(app)
        .delete('/api/products/507f1f77bcf86cd799439011')
        .expect(204);

      expect(ProductManager.prototype.deleteProduct).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return 404 when deleting non-existent product', async () => {
      const ProductManager = require('../../src/managers/ProductManager');
      ProductManager.prototype.deleteProduct = jest.fn().mockRejectedValue(new Error('Producto no encontrado'));

      const response = await request(app)
        .delete('/api/products/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Producto no encontrado');
    });
  });
});
