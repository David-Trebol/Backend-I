const mongoose = require('mongoose');
const Product = require('../models/Product');
const { emitProductAdded, emitProductDeleted } = require('../utils/socket.utils');

class ProductManager {
    constructor() {
        // Eliminar la inicialización de this.path y this.products
        // this.path = path.join(__dirname, '../data/products.json');
        // this.products = [];
        // this.loadProducts();
    }

    // Eliminar el método loadProducts que leía el archivo
    // async loadProducts() {
    //     try {
    //         const data = await fs.readFile(this.path, 'utf-8');
    //         this.products = JSON.parse(data);
    //     } catch (error) {
    //         this.products = [];
    //         await this.saveProducts();
    //     }
    // }

    // Eliminar el método saveProducts que escribía en el archivo
    // async saveProducts() {
    //     await fs.writeFile(this.path, JSON.stringify(this.products, null, 2));
    // }

    // Actualizar getProducts para obtener productos desde MongoDB
    async getProducts(filter = {}, options = {}) {
        const { limit = 10, page = 1, sort = {} } = options;
        const skip = (page - 1) * limit;
        return await Product.find(filter).sort(sort).skip(skip).limit(limit);
    }

    // Actualizar getProductById para buscar un producto por su ID en MongoDB
    async getProductById(id) {
        const product = await Product.findById(id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return product;
    }

    // Actualizar addProduct para crear un nuevo producto en MongoDB
    async addProduct(productData) {
        // Validar campos obligatorios
        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
        for (const field of requiredFields) {
            if (!productData[field]) {
                throw new Error(`El campo ${field} es obligatorio`);
            }
        }

        // Verificar si el código ya existe
        const existingProduct = await Product.findOne({ code: productData.code });
        if (existingProduct) {
            throw new Error('El código del producto ya existe');
        }

        const newProduct = new Product({
            title: productData.title,
            description: productData.description,
            code: productData.code,
            price: Number(productData.price),
            status: productData.status !== undefined ? productData.status : true,
            stock: Number(productData.stock),
            category: productData.category,
            thumbnails: productData.thumbnails || []
        });

        await newProduct.save();
        // Emitir evento de nuevo producto
        emitProductAdded(newProduct);
        return newProduct;
    }

    // Actualizar updateProduct para actualizar un producto en MongoDB
    async updateProduct(id, updateData) {
        // No permitir actualizar el ID
        if (updateData.id) {
            delete updateData.id;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedProduct) {
            throw new Error('Producto no encontrado');
        }
        return updatedProduct;
    }

    // Actualizar deleteProduct para eliminar un producto en MongoDB
    async deleteProduct(id) {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            throw new Error('Producto no encontrado');
        }
        // Emitir evento de producto eliminado
        emitProductDeleted(id);
    }
}

module.exports = ProductManager; 