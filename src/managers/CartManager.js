const fs = require('fs').promises;
const path = require('path');

class CartManager {
    constructor() {
        this.path = path.join(__dirname, '../data/carts.json');
        this.carts = [];
        this.loadCarts();
    }

    async loadCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            this.carts = JSON.parse(data);
        } catch (error) {
            this.carts = [];
            await this.saveCarts();
        }
    }

    async saveCarts() {
        await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2));
    }

    async createCart() {
        await this.loadCarts();
        
        const newCart = {
            id: Date.now().toString(),
            products: []
        };

        this.carts.push(newCart);
        await this.saveCarts();
        return newCart;
    }

    async getCartById(cid) {
        await this.loadCarts();
        const cart = this.carts.find(c => c.id === cid);
        
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        
        return cart;
    }

    async addProductToCart(cid, pid) {
        await this.loadCarts();
        const cartIndex = this.carts.findIndex(c => c.id === cid);
        
        if (cartIndex === -1) {
            throw new Error('Carrito no encontrado');
        }

        const cart = this.carts[cartIndex];
        const productIndex = cart.products.findIndex(p => p.product === pid);

        if (productIndex === -1) {
            // Si el producto no existe en el carrito, lo agregamos
            cart.products.push({
                product: pid,
                quantity: 1
            });
        } else {
            // Si el producto ya existe, incrementamos la cantidad
            cart.products[productIndex].quantity += 1;
        }

        await this.saveCarts();
        return cart;
    }
}

module.exports = CartManager; 