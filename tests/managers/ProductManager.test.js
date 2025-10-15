const ProductManager = require('../../src/managers/ProductManager');
const Product = require('../../src/models/Product');

// Mock del modelo Product
jest.mock('../../src/models/Product');

describe('ProductManager', () => {
  let productManager;

  beforeEach(() => {
    productManager = new ProductManager();
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should get products with default pagination', async () => {
      const mockProducts = [
        { _id: '1', name: 'Product 1', price: 100 },
        { _id: '2', name: 'Product 2', price: 200 }
      ];

      Product.paginate = jest.fn().mockResolvedValue({
        docs: mockProducts,
        totalDocs: 2,
        limit: 10,
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      });

      const result = await productManager.getProducts({}, { limit: 10, page: 1 });

      expect(result).toBeDefined();
      expect(result.docs).toHaveLength(2);
      expect(Product.paginate).toHaveBeenCalledWith(
        {},
        { limit: 10, page: 1, sort: {} }
      );
    });

    it('should get products with filters', async () => {
      const filter = { category: 'electronics' };
      const options = { limit: 5, page: 1 };

      Product.paginate = jest.fn().mockResolvedValue({
        docs: [],
        totalDocs: 0,
        limit: 5,
        page: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      });

      await productManager.getProducts(filter, options);

      expect(Product.paginate).toHaveBeenCalledWith(
        filter,
        options
      );
    });

    it('should handle errors when getting products', async () => {
      Product.paginate = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(productManager.getProducts({}, {})).rejects.toThrow('Database error');
    });
  });

  describe('getProductById', () => {
    it('should get product by valid ID', async () => {
      const mockProduct = { _id: '1', name: 'Product 1', price: 100 };
      Product.findById = jest.fn().mockResolvedValue(mockProduct);

      const result = await productManager.getProductById('1');

      expect(result).toBe(mockProduct);
      expect(Product.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error for invalid ID', async () => {
      Product.findById = jest.fn().mockResolvedValue(null);

      await expect(productManager.getProductById('invalid')).rejects.toThrow('Producto no encontrado');
    });
  });

  describe('addProduct', () => {
    it('should add a new product', async () => {
      const productData = {
        name: 'New Product',
        price: 150,
        category: 'electronics'
      };

      const mockProduct = { _id: '1', ...productData };
      const mockProductInstance = {
        save: jest.fn().mockResolvedValue(mockProduct)
      };

      Product.mockImplementation(() => mockProductInstance);

      const result = await productManager.addProduct(productData);

      expect(result).toBe(mockProduct);
      expect(mockProductInstance.save).toHaveBeenCalled();
    });

    it('should handle errors when adding product', async () => {
      const productData = { name: 'Test Product' };
      
      const mockProductInstance = {
        save: jest.fn().mockRejectedValue(new Error('Validation error'))
      };

      Product.mockImplementation(() => mockProductInstance);

      await expect(productManager.addProduct(productData)).rejects.toThrow('Validation error');
    });
  });

  describe('updateProduct', () => {
    it('should update existing product', async () => {
      const updateData = { name: 'Updated Product' };
      const mockProduct = { 
        _id: '1', 
        ...updateData,
        save: jest.fn().mockResolvedValue(true)
      };

      Product.findById = jest.fn().mockResolvedValue(mockProduct);

      const result = await productManager.updateProduct('1', updateData);

      expect(result).toBe(mockProduct);
      expect(mockProduct.name).toBe(updateData.name);
      expect(mockProduct.save).toHaveBeenCalled();
    });

    it('should throw error when updating non-existent product', async () => {
      Product.findById = jest.fn().mockResolvedValue(null);

      await expect(productManager.updateProduct('invalid', {})).rejects.toThrow('Producto no encontrado');
    });
  });

  describe('deleteProduct', () => {
    it('should delete existing product', async () => {
      const mockProduct = { 
        _id: '1',
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
      };

      Product.findById = jest.fn().mockResolvedValue(mockProduct);

      await productManager.deleteProduct('1');

      expect(mockProduct.deleteOne).toHaveBeenCalled();
    });

    it('should throw error when deleting non-existent product', async () => {
      Product.findById = jest.fn().mockResolvedValue(null);

      await expect(productManager.deleteProduct('invalid')).rejects.toThrow('Producto no encontrado');
    });
  });
});
