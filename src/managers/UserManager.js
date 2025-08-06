const UserRepository = require('../repositories/UserRepository');
const { hashPassword } = require('../utils/hash.utils');

class UserManager {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async getUsers(filter = {}, options = {}) {
        return await this.userRepository.findAll(filter, options);
    }

    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) throw new Error('Usuario no encontrado');
        return user;
    }

    async getUserByIdWithCart(id) {
        const user = await this.userRepository.findByIdWithCart(id);
        if (!user) throw new Error('Usuario no encontrado');
        return user;
    }

    async getUserByEmail(email) {
        return await this.userRepository.findByEmail(email);
    }

    async addUser(userData) {
        // Validar campos obligatorios
        const requiredFields = ['first_name', 'last_name', 'email', 'age', 'password'];
        for (const field of requiredFields) {
            if (!userData[field]) {
                throw new Error(`El campo ${field} es obligatorio`);
            }
        }

        // Verificar si el email ya existe
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) throw new Error('El email ya está registrado');

        // Hashear la contraseña
        userData.password = hashPassword(userData.password);

        // Crear usuario con carrito
        return await this.userRepository.createWithCart(userData);
    }

    async updateUser(id, updateData) {
        if (updateData.id) delete updateData.id;
        
        const updatedUser = await this.userRepository.update(id, updateData);
        if (!updatedUser) throw new Error('Usuario no encontrado');
        return updatedUser;
    }

    async deleteUser(id) {
        return await this.userRepository.deleteWithCart(id);
    }

    // Métodos adicionales que aprovechan el repositorio
    async updateUserRole(id, role) {
        return await this.userRepository.updateUserRole(id, role);
    }

    async updatePassword(id, newPassword) {
        const hashedPassword = hashPassword(newPassword);
        return await this.userRepository.updatePassword(id, hashedPassword);
    }

    async getAdmins() {
        return await this.userRepository.findAdmins();
    }

    async getUsersByRole(role) {
        return await this.userRepository.findUsersByRole(role);
    }

    async getUsersByAgeRange(minAge, maxAge) {
        return await this.userRepository.findUsersByAgeRange(minAge, maxAge);
    }

    async assignCartToUser(userId, cartId) {
        return await this.userRepository.assignCartToUser(userId, cartId);
    }

    async removeCartFromUser(userId) {
        return await this.userRepository.removeCartFromUser(userId);
    }

    async getUsersCount(filter = {}) {
        return await this.userRepository.count(filter);
    }
}

module.exports = UserManager; 