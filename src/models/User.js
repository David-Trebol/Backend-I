const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    last_name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 120
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: [
            'customer',      // Cliente regular
            'premium',       // Cliente premium
            'vip',          // Cliente VIP
            'seller',       // Vendedor
            'manager',      // Gerente de tienda
            'admin',        // Administrador del sistema
            'support',      // Soporte al cliente
            'finance',      // Finanzas
            'logistics'     // Logística
        ],
        default: 'customer'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'pending_verification'],
        default: 'pending_verification'
    },
    // Información de compras
    purchaseHistory: {
        totalPurchases: {
            type: Number,
            default: 0
        },
        totalSpent: {
            type: Number,
            default: 0
        },
        lastPurchase: {
            type: Date
        },
        averageOrderValue: {
            type: Number,
            default: 0
        }
    },
    // Preferencias de compra
    preferences: {
        preferredCategories: [{
            type: String,
            trim: true
        }],
        preferredPaymentMethod: {
            type: String,
            enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'],
            default: 'credit_card'
        },
        newsletterSubscription: {
            type: Boolean,
            default: true
        },
        marketingEmails: {
            type: Boolean,
            default: true
        }
    },
    // Información de contacto
    contact: {
        phone: {
            type: String,
            trim: true
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: {
                type: String,
                default: 'Argentina'
            }
        }
    },
    // Información de verificación
    verification: {
        emailVerified: {
            type: Boolean,
            default: false
        },
        phoneVerified: {
            type: Boolean,
            default: false
        },
        identityVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationToken: String,
        emailVerificationExpires: Date,
        phoneVerificationCode: String,
        phoneVerificationExpires: Date
    },
    // Configuración de seguridad
    security: {
        loginAttempts: {
            type: Number,
            default: 0
        },
        lockoutUntil: Date,
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: String
    },
    // Información de la cuenta
    account: {
        createdAt: {
            type: Date,
            default: Date.now
        },
        lastLogin: Date,
        loginCount: {
            type: Number,
            default: 0
        },
        isOnline: {
            type: Boolean,
            default: false
        }
    },
    // Carrito del usuario
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    // Wishlist del usuario
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    // Cupones y descuentos
    coupons: [{
        code: String,
        discount: Number,
        type: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: 'percentage'
        },
        validFrom: Date,
        validUntil: Date,
        used: {
            type: Boolean,
            default: false
        },
        minimumPurchase: {
            type: Number,
            default: 0
        }
    }],
    // Historial de cupones usados
    usedCoupons: [{
        code: String,
        discount: Number,
        usedAt: {
            type: Date,
            default: Date.now
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        }
    }],
    // Configuración de notificaciones
    notifications: {
        email: {
            orders: { type: Boolean, default: true },
            promotions: { type: Boolean, default: true },
            security: { type: Boolean, default: true },
            newsletter: { type: Boolean, default: true }
        },
        push: {
            orders: { type: Boolean, default: true },
            promotions: { type: Boolean, default: true },
            security: { type: Boolean, default: true }
        },
        sms: {
            orders: { type: Boolean, default: false },
            security: { type: Boolean, default: true }
        }
    }
}, {
    timestamps: true
});

// Índices para optimizar consultas
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'purchaseHistory.totalSpent': -1 });
userSchema.index({ 'account.createdAt': -1 });

// Método para hashear contraseña
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.security.passwordChangedAt = Date.now() - 1000;
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar si la contraseña fue cambiada después de un token
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.security.passwordChangedAt) {
        const changedTimestamp = parseInt(this.security.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Método para actualizar historial de compras
userSchema.methods.updatePurchaseHistory = function(orderTotal) {
    this.purchaseHistory.totalPurchases += 1;
    this.purchaseHistory.totalSpent += orderTotal;
    this.purchaseHistory.lastPurchase = new Date();
    this.purchaseHistory.averageOrderValue = this.purchaseHistory.totalSpent / this.purchaseHistory.totalPurchases;
    
    // Actualizar rol basado en el gasto total
    if (this.purchaseHistory.totalSpent >= 10000 && this.role === 'customer') {
        this.role = 'premium';
    } else if (this.purchaseHistory.totalSpent >= 50000 && this.role === 'premium') {
        this.role = 'vip';
    }
    
    return this.save();
};

// Método para verificar permisos de compra
userSchema.methods.canPurchase = function() {
    return this.status === 'active' && this.verification.emailVerified;
};

// Método para obtener descuento basado en rol
userSchema.methods.getRoleDiscount = function() {
    const discounts = {
        customer: 0,
        premium: 5,
        vip: 10,
        seller: 15,
        manager: 20,
        admin: 25,
        support: 10,
        finance: 15,
        logistics: 10
    };
    return discounts[this.role] || 0;
};

// Método para verificar límites de compra
userSchema.methods.getPurchaseLimits = function() {
    const limits = {
        customer: { maxOrderValue: 50000, maxItems: 50 },
        premium: { maxOrderValue: 100000, maxItems: 100 },
        vip: { maxOrderValue: 500000, maxItems: 200 },
        seller: { maxOrderValue: 1000000, maxItems: 500 },
        manager: { maxOrderValue: 2000000, maxItems: 1000 },
        admin: { maxOrderValue: 999999999, maxItems: 9999 },
        support: { maxOrderValue: 100000, maxItems: 100 },
        finance: { maxOrderValue: 500000, maxItems: 200 },
        logistics: { maxOrderValue: 200000, maxItems: 150 }
    };
    return limits[this.role] || limits.customer;
};

// Método para verificar si puede aplicar cupones
userSchema.methods.canApplyCoupons = function() {
    return ['premium', 'vip', 'seller', 'manager', 'admin'].includes(this.role);
};

// Método para verificar si puede ver precios de mayorista
userSchema.methods.canSeeWholesalePrices = function() {
    return ['seller', 'manager', 'admin', 'finance'].includes(this.role);
};

// Método para verificar si puede gestionar inventario
userSchema.methods.canManageInventory = function() {
    return ['seller', 'manager', 'admin', 'logistics'].includes(this.role);
};

// Método para verificar si puede procesar reembolsos
userSchema.methods.canProcessRefunds = function() {
    return ['manager', 'admin', 'finance', 'support'].includes(this.role);
};

// Método para verificar si puede ver reportes financieros
userSchema.methods.canViewFinancialReports = function() {
    return ['manager', 'admin', 'finance'].includes(this.role);
};

// Método para obtener información pública del usuario
userSchema.methods.getPublicInfo = function() {
    return {
        id: this._id,
        first_name: this.first_name,
        last_name: this.last_name,
        email: this.email,
        role: this.role,
        status: this.status,
        purchaseHistory: {
            totalPurchases: this.purchaseHistory.totalPurchases,
            totalSpent: this.purchaseHistory.totalSpent,
            averageOrderValue: this.purchaseHistory.averageOrderValue
        },
        preferences: {
            preferredCategories: this.preferences.preferredCategories,
            preferredPaymentMethod: this.preferences.preferredPaymentMethod
        },
        account: {
            createdAt: this.account.createdAt,
            lastLogin: this.account.lastLogin
        }
    };
};

// Método para verificar si el usuario está bloqueado
userSchema.methods.isLocked = function() {
    return this.security.lockoutUntil && this.security.lockoutUntil > Date.now();
};

// Método para incrementar intentos de login
userSchema.methods.incrementLoginAttempts = function() {
    this.security.loginAttempts += 1;
    
    if (this.security.loginAttempts >= 5) {
        this.security.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    }
    
    return this.save();
};

// Método para resetear intentos de login
userSchema.methods.resetLoginAttempts = function() {
    this.security.loginAttempts = 0;
    this.security.lockoutUntil = null;
    this.account.lastLogin = new Date();
    this.account.loginCount += 1;
    return this.save();
};

module.exports = mongoose.model('User', userSchema); 