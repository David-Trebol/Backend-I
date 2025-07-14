const User = require('../models/User');
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/hash.utils');

class UserManager {
    async getUsers(filter = {}, options = {}) {
        const { limit = 10, page = 1, sort = {} } = options;
        const skip = (page - 1) * limit;
        return await User.find(filter).sort(sort).skip(skip).limit(limit);
    }

    async getUserById(id) {
        const user = await User.findById(id);
        if (!user) throw new Error('Usuario no encontrado');
        return user;
    }

    async getUserByEmail(email) {
        return await User.findOne({ email });
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
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) throw new Error('El email ya está registrado');
        // Hashear la contraseña
        userData.password = hashPassword(userData.password);
        const newUser = new User(userData);
        await newUser.save();
        return newUser;
    }

    async updateUser(id, updateData) {
        if (updateData.id) delete updateData.id;
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedUser) throw new Error('Usuario no encontrado');
        return updatedUser;
    }

    async deleteUser(id) {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) throw new Error('Usuario no encontrado');
        return deletedUser;
    }
}

module.exports = UserManager; 