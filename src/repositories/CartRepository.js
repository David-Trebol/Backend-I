const BaseRepository = require('./BaseRepository');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartRepository extends BaseRepository {
    constructor() {
        super(Cart);
    }

    async findByIdWithProducts(id) {
        return await this.model.findById(id).populate('products.product');
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        const cart = await this.findById(cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        // Verificar que el producto existe
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        // Verificar stock
        if (product.stock < quantity) {
            throw new Error('Stock insuficiente');
        }

        // Buscar si el producto ya está en el carrito
        const existingProductIndex = cart.products.findIndex(
            item => item.product.toString() === productId
        );

        if (existingProductIndex !== -1) {
            // Actualizar cantidad si ya existe
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            // Agregar nuevo producto
            cart.products.push({
                product: productId,
                quantity: quantity
            });
        }

        return await cart.save();
    }

    async removeProductFromCart(cartId, productId) {
        const cart = await this.findById(cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        cart.products = cart.products.filter(
            item => item.product.toString() !== productId
        );

        return await cart.save();
    }

    async updateProductQuantity(cartId, productId, quantity) {
        const cart = await this.findById(cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        const productItem = cart.products.find(
            item => item.product.toString() === productId
        );

        if (!productItem) {
            throw new Error('Producto no encontrado en el carrito');
        }

        if (quantity <= 0) {
            return await this.removeProductFromCart(cartId, productId);
        }

        // Verificar stock
        const product = await Product.findById(productId);
        if (product.stock < quantity) {
            throw new Error('Stock insuficiente');
        }

        productItem.quantity = quantity;
        return await cart.save();
    }

    async clearCart(cartId) {
        const cart = await this.findById(cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        cart.products = [];
        return await cart.save();
    }

    async getCartTotal(cartId) {
        const cart = await this.findByIdWithProducts(cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        return cart.products.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    }

    async getCartItemCount(cartId) {
        const cart = await this.findById(cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        return cart.products.reduce((total, item) => {
            return total + item.quantity;
        }, 0);
    }
}

module.exports = CartRepository; 