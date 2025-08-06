const ProductRepository = require('../repositories/ProductRepository');

class ProductManager {
    constructor() {
        this.productRepository = new ProductRepository();
    }

    async getProducts(filter = {}, options = {}) {
        return await this.productRepository.findAll(filter, options);
    }

    async getProductById(id) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return product;
    }

    async addProduct(productData) {
        return await this.productRepository.createWithValidation(productData);
    }

    async updateProduct(id, updateData) {
        // No permitir actualizar el ID
        if (updateData.id) {
            delete updateData.id;
        }

        const updatedProduct = await this.productRepository.update(id, updateData);
        if (!updatedProduct) {
            throw new Error('Producto no encontrado');
        }
        return updatedProduct;
    }

    async deleteProduct(id) {
        return await this.productRepository.deleteWithEvent(id);
    }

    // Métodos adicionales que aprovechan el repositorio
    async getProductsByCategory(category, options = {}) {
        return await this.productRepository.findByCategory(category, options);
    }

    async getProductsByPriceRange(minPrice, maxPrice, options = {}) {
        return await this.productRepository.findByPriceRange(minPrice, maxPrice, options);
    }

    async getProductsInStock(options = {}) {
        return await this.productRepository.findInStock(options);
    }

    async updateProductStock(id, quantity) {
        return await this.productRepository.updateStock(id, quantity);
    }

    async getProductByCode(code) {
        return await this.productRepository.findByCode(code);
    }

    async getProductsCount(filter = {}) {
        return await this.productRepository.count(filter);
    }
}

module.exports = ProductManager; 