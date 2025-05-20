const fs = require('fs').promises;
const path = require('path');
const { emitProductAdded, emitProductDeleted } = require('../utils/socket.utils');

class ProductManager {
    constructor() {
        this.path = path.join(__dirname, '../data/products.json');
        this.products = [];
        this.loadProducts();
    }

    async loadProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            this.products = JSON.parse(data);
        } catch (error) {
            this.products = [];
            await this.saveProducts();
        }
    }

    async saveProducts() {
        await fs.writeFile(this.path, JSON.stringify(this.products, null, 2));
    }

    async getProducts() {
        await this.loadProducts();
        return this.products;
    }

    async getProductById(id) {
        await this.loadProducts();
        const product = this.products.find(p => p.id === id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return product;
    }

    async addProduct(productData) {
        await this.loadProducts();
        
        // Validar campos obligatorios
        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
        for (const field of requiredFields) {
            if (!productData[field]) {
                throw new Error(`El campo ${field} es obligatorio`);
            }
        }

        // Generar ID único
        const id = Date.now().toString();
        
        // Verificar si el código ya existe
        if (this.products.some(p => p.code === productData.code)) {
            throw new Error('El código del producto ya existe');
        }

        const newProduct = {
            id,
            title: productData.title,
            description: productData.description,
            code: productData.code,
            price: Number(productData.price),
            status: productData.status !== undefined ? productData.status : true,
            stock: Number(productData.stock),
            category: productData.category,
            thumbnails: productData.thumbnails || []
        };

        this.products.push(newProduct);
        await this.saveProducts();
        
        // Emitir evento de nuevo producto
        emitProductAdded(newProduct);
        
        return newProduct;
    }

    async updateProduct(id, updateData) {
        await this.loadProducts();
        const index = this.products.findIndex(p => p.id === id);
        
        if (index === -1) {
            throw new Error('Producto no encontrado');
        }

        // No permitir actualizar el ID
        if (updateData.id) {
            delete updateData.id;
        }

        this.products[index] = {
            ...this.products[index],
            ...updateData
        };

        await this.saveProducts();
        return this.products[index];
    }

    async deleteProduct(id) {
        await this.loadProducts();
        const index = this.products.findIndex(p => p.id === id);
        
        if (index === -1) {
            throw new Error('Producto no encontrado');
        }

        this.products.splice(index, 1);
        await this.saveProducts();
        
        // Emitir evento de producto eliminado
        emitProductDeleted(id);
    }
}

module.exports = ProductManager; 