const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const UserManager = require('../managers/UserManager');
const PasswordResetTokenRepository = require('../repositories/PasswordResetTokenRepository');
const EmailService = require('./emailService');

class PasswordResetService {
    constructor() {
        this.userManager = new UserManager();
        this.tokenRepository = new PasswordResetTokenRepository();
        this.emailService = new EmailService();
    }

    // Generar token único para recuperación de contraseña
    generateResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Solicitar recuperación de contraseña
    async requestPasswordReset(email) {
        try {
            // Buscar usuario por email
            const user = await this.userManager.getUserByEmail(email);
            if (!user) {
                throw new Error('No existe un usuario con ese email');
            }

            // Verificar si ya hay tokens activos
            const activeTokensCount = await this.tokenRepository.getActiveTokensCount(user._id);
            if (activeTokensCount > 0) {
                throw new Error('Ya tienes una solicitud de recuperación pendiente. Revisa tu correo o espera 1 hora.');
            }

            // Generar token único
            const resetToken = this.generateResetToken();
            
            // Guardar contraseña actual para comparación
            const previousPassword = user.password;

            // Crear token en base de datos
            const tokenRecord = await this.tokenRepository.createToken(
                user._id,
                resetToken,
                previousPassword
            );

            // Generar URL de recuperación
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

            // Enviar email
            const emailSent = await this.emailService.sendPasswordResetEmail(user, resetToken, resetUrl);
            
            if (!emailSent) {
                // Si falla el envío, eliminar el token
                await this.tokenRepository.delete(tokenRecord._id);
                throw new Error('Error enviando el email. Intenta nuevamente.');
            }

            return {
                success: true,
                message: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña.',
                expiresIn: '1 hora'
            };

        } catch (error) {
            throw error;
        }
    }

    // Verificar token de recuperación
    async verifyResetToken(token) {
        try {
            const resetToken = await this.tokenRepository.findValidToken(token);
            
            if (!resetToken) {
                throw new Error('Token inválido o expirado');
            }

            // Obtener usuario
            const user = await this.userManager.getUserById(resetToken.user);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            return {
                valid: true,
                user: {
                    id: user._id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name
                },
                expiresAt: resetToken.expiresAt
            };

        } catch (error) {
            throw error;
        }
    }

    // Restablecer contraseña
    async resetPassword(token, newPassword) {
        try {
            // Verificar token
            const resetToken = await this.tokenRepository.findValidToken(token);
            if (!resetToken) {
                throw new Error('Token inválido o expirado');
            }

            // Obtener usuario
            const user = await this.userManager.getUserById(resetToken.user);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar que la nueva contraseña no sea igual a la anterior
            const isSamePassword = await bcrypt.compare(newPassword, resetToken.previousPassword);
            if (isSamePassword) {
                throw new Error('La nueva contraseña no puede ser igual a la anterior');
            }

            // Verificar que la nueva contraseña no sea igual a la actual
            const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
            if (isSameAsCurrent) {
                throw new Error('La nueva contraseña no puede ser igual a la actual');
            }

            // Validar contraseña
            if (newPassword.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }

            // Actualizar contraseña del usuario
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.userManager.updatePassword(user._id, hashedPassword);

            // Marcar token como usado
            await this.tokenRepository.markAsUsed(resetToken._id);

            // Enviar email de confirmación
            await this.emailService.sendPasswordChangedEmail(user);

            return {
                success: true,
                message: 'Contraseña restablecida exitosamente. Se ha enviado un correo de confirmación.'
            };

        } catch (error) {
            throw error;
        }
    }

    // Limpiar tokens expirados
    async cleanupExpiredTokens() {
        try {
            const deletedCount = await this.tokenRepository.deleteExpiredTokens();
            console.log(`Se eliminaron ${deletedCount} tokens expirados`);
            return deletedCount;
        } catch (error) {
            console.error('Error limpiando tokens expirados:', error);
            return 0;
        }
    }

    // Obtener estadísticas de tokens
    async getTokenStats() {
        try {
            const totalTokens = await this.tokenRepository.count({});
            const activeTokens = await this.tokenRepository.count({
                used: false,
                expiresAt: { $gt: new Date() }
            });
            const expiredTokens = await this.tokenRepository.count({
                expiresAt: { $lt: new Date() }
            });

            return {
                total: totalTokens,
                active: activeTokens,
                expired: expiredTokens
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas de tokens:', error);
            return { total: 0, active: 0, expired: 0 };
        }
    }

    // Cancelar solicitud de recuperación
    async cancelPasswordReset(token) {
        try {
            const resetToken = await this.tokenRepository.findByToken(token);
            if (!resetToken) {
                throw new Error('Token no encontrado');
            }

            await this.tokenRepository.markAsUsed(resetToken._id);

            return {
                success: true,
                message: 'Solicitud de recuperación cancelada exitosamente'
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = PasswordResetService; 