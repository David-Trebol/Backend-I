const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index para expiración automática
    },
    used: {
        type: Boolean,
        default: false
    },
    previousPassword: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Método para verificar si el token ha expirado
passwordResetTokenSchema.methods.isExpired = function() {
    return Date.now() > this.expiresAt;
};

// Método para verificar si el token es válido
passwordResetTokenSchema.methods.isValid = function() {
    return !this.used && !this.isExpired();
};

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema); 