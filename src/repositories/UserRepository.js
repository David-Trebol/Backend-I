const BaseRepository = require('./BaseRepository');
const User = require('../models/User');
const Cart = require('../models/Cart');

class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async findByEmail(email) {
        return await this.findOne({ email });
    }

    async findByIdWithCart(id) {
        return await this.model.findById(id).populate('cart');
    }

    async createWithCart(userData) {
        // Crear carrito para el usuario
        const cart = new Cart();
        await cart.save();

        // Crear usuario con el carrito asignado
        const user = new User({
            ...userData,
            cart: cart._id
        });

        return await user.save();
    }

    async updateUserRole(id, role) {
        if (!['user', 'admin'].includes(role)) {
            throw new Error('Rol inválido');
        }

        return await this.update(id, { role });
    }

    async findAdmins() {
        return await this.findAll({ role: 'admin' });
    }

    async findUsers() {
        return await this.findAll({ role: 'user' });
    }

    async updatePassword(id, newPassword) {
        return await this.update(id, { password: newPassword });
    }

    async deleteWithCart(id) {
        const user = await this.findByIdWithCart(id);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Eliminar carrito asociado si existe
        if (user.cart) {
            await Cart.findByIdAndDelete(user.cart._id);
        }

        // Eliminar usuario
        return await this.delete(id);
    }

    async assignCartToUser(userId, cartId) {
        return await this.update(userId, { cart: cartId });
    }

    async removeCartFromUser(userId) {
        return await this.update(userId, { cart: null });
    }

    async findUsersByAgeRange(minAge, maxAge) {
        const filter = {
            age: {
                $gte: minAge,
                $lte: maxAge
            }
        };
        return await this.findAll(filter);
    }

    async findUsersByRole(role) {
        return await this.findAll({ role });
    }
}

module.exports = UserRepository; 