const BaseRepository = require('./BaseRepository');
const PasswordResetToken = require('../models/PasswordResetToken');

class PasswordResetTokenRepository extends BaseRepository {
    constructor() {
        super(PasswordResetToken);
    }

    async findByToken(token) {
        return await this.findOne({ token });
    }

    async findByUser(userId) {
        return await this.findAll({ user: userId });
    }

    async findValidToken(token) {
        const resetToken = await this.findByToken(token);
        if (!resetToken) {
            return null;
        }
        
        // Verificar si el token es válido
        if (!resetToken.isValid()) {
            return null;
        }
        
        return resetToken;
    }

    async createToken(userId, token, previousPassword) {
        // Eliminar tokens anteriores del usuario
        await this.model.deleteMany({ user: userId });
        
        // Crear nuevo token con expiración de 1 hora
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        
        return await this.create({
            user: userId,
            token: token,
            expiresAt: expiresAt,
            previousPassword: previousPassword
        });
    }

    async markAsUsed(tokenId) {
        return await this.update(tokenId, { used: true });
    }

    async deleteExpiredTokens() {
        return await this.model.deleteMany({
            expiresAt: { $lt: new Date() }
        });
    }

    async deleteUserTokens(userId) {
        return await this.model.deleteMany({ user: userId });
    }

    async getActiveTokensCount(userId) {
        return await this.count({
            user: userId,
            used: false,
            expiresAt: { $gt: new Date() }
        });
    }
}

module.exports = PasswordResetTokenRepository; 