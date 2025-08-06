const CartRepository = require('../repositories/CartRepository');

class CartManager {
    constructor() {
        this.cartRepository = new CartRepository();
    }

    async createCart() {
        return await this.cartRepository.create({ products: [] });
    }

    async getCartById(id) {
        const cart = await this.cartRepository.findById(id);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        return cart;
    }

    async getCartByIdWithProducts(id) {
        const cart = await this.cartRepository.findByIdWithProducts(id);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        return cart;
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        return await this.cartRepository.addProductToCart(cartId, productId, quantity);
    }

    async removeProductFromCart(cartId, productId) {
        return await this.cartRepository.removeProductFromCart(cartId, productId);
    }

    async updateProductQuantity(cartId, productId, quantity) {
        return await this.cartRepository.updateProductQuantity(cartId, productId, quantity);
    }

    async clearCart(cartId) {
        return await this.cartRepository.clearCart(cartId);
    }

    async getCarts() {
        return await this.cartRepository.findAll();
    }

    async addCart(cartData) {
        // Validar campos obligatorios
        const requiredFields = ['products'];
        for (const field of requiredFields) {
            if (!cartData[field]) {
                throw new Error(`El campo ${field} es obligatorio`);
            }
        }

        return await this.cartRepository.create(cartData);
    }

    async updateCart(id, updateData) {
        const updatedCart = await this.cartRepository.update(id, updateData);
        if (!updatedCart) {
            throw new Error('Carrito no encontrado');
        }
        return updatedCart;
    }

    async deleteCart(id) {
        const deletedCart = await this.cartRepository.delete(id);
        if (!deletedCart) {
            throw new Error('Carrito no encontrado');
        }
        return deletedCart;
    }

    // Métodos adicionales que aprovechan el repositorio
    async getCartTotal(cartId) {
        return await this.cartRepository.getCartTotal(cartId);
    }

    async getCartItemCount(cartId) {
        return await this.cartRepository.getCartItemCount(cartId);
    }

    async getCartsCount(filter = {}) {
        return await this.cartRepository.count(filter);
    }
}

module.exports = CartManager; 