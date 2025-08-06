const BaseRepository = require('./BaseRepository');
const Product = require('../models/Product');
const { emitProductAdded, emitProductDeleted } = require('../utils/socket.utils');

class ProductRepository extends BaseRepository {
    constructor() {
        super(Product);
    }

    async findByCode(code) {
        return await this.findOne({ code });
    }

    async findByCategory(category, options = {}) {
        return await this.findAll({ category }, options);
    }

    async findByPriceRange(minPrice, maxPrice, options = {}) {
        const filter = {
            price: {
                $gte: minPrice,
                $lte: maxPrice
            }
        };
        return await this.findAll(filter, options);
    }

    async findInStock(options = {}) {
        return await this.findAll({ stock: { $gt: 0 } }, options);
    }

    async updateStock(id, quantity) {
        return await this.model.findByIdAndUpdate(
            id,
            { $inc: { stock: -quantity } },
            { new: true }
        );
    }

    async createWithValidation(productData) {
        // Validar campos obligatorios
        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
        for (const field of requiredFields) {
            if (!productData[field]) {
                throw new Error(`El campo ${field} es obligatorio`);
            }
        }

        // Verificar si el código ya existe
        const existingProduct = await this.findByCode(productData.code);
        if (existingProduct) {
            throw new Error('El código del producto ya existe');
        }

        const newProduct = await this.create({
            title: productData.title,
            description: productData.description,
            code: productData.code,
            price: Number(productData.price),
            status: productData.status !== undefined ? productData.status : true,
            stock: Number(productData.stock),
            category: productData.category,
            thumbnails: productData.thumbnails || []
        });

        // Emitir evento de nuevo producto
        emitProductAdded(newProduct);
        return newProduct;
    }

    async deleteWithEvent(id) {
        const deletedProduct = await this.delete(id);
        if (!deletedProduct) {
            throw new Error('Producto no encontrado');
        }
        // Emitir evento de producto eliminado
        emitProductDeleted(id);
        return deletedProduct;
    }
}

module.exports = ProductRepository; 