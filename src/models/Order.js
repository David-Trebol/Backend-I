const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // Información del cliente
    customer: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: String,
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
    // Información de la orden
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: String,
        enum: [
            'pending',           // Pendiente de pago
            'paid',             // Pagado
            'processing',       // En procesamiento
            'shipped',          // Enviado
            'delivered',        // Entregado
            'cancelled',        // Cancelado
            'refunded',         // Reembolsado
            'returned',         // Devuelto
            'on_hold',          // En espera
            'backorder'         // Pedido pendiente
        ],
        default: 'pending'
    },
    // Productos de la orden
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        subtotal: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            default: 0
        },
        tax: {
            type: Number,
            default: 0
        }
    }],
    // Información de precios
    pricing: {
        subtotal: {
            type: Number,
            required: true
        },
        tax: {
            type: Number,
            default: 0
        },
        shipping: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'ARS'
        }
    },
    // Información de pago
    payment: {
        method: {
            type: String,
            enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash', 'crypto'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: String,
        gateway: String,
        paidAt: Date,
        refundedAt: Date,
        refundAmount: Number
    },
    // Información de envío
    shipping: {
        method: {
            type: String,
            enum: ['standard', 'express', 'overnight', 'pickup'],
            default: 'standard'
        },
        cost: {
            type: Number,
            default: 0
        },
        trackingNumber: String,
        carrier: String,
        estimatedDelivery: Date,
        shippedAt: Date,
        deliveredAt: Date
    },
    // Información de autorización
    authorization: {
        // Quién puede ver esta orden
        viewPermissions: [{
            type: String,
            enum: ['customer', 'premium', 'vip', 'seller', 'manager', 'admin', 'support', 'finance', 'logistics']
        }],
        // Quién puede modificar esta orden
        editPermissions: [{
            type: String,
            enum: ['manager', 'admin', 'support']
        }],
        // Quién puede cancelar esta orden
        cancelPermissions: [{
            type: String,
            enum: ['customer', 'manager', 'admin', 'support']
        }],
        // Quién puede procesar reembolsos
        refundPermissions: [{
            type: String,
            enum: ['manager', 'admin', 'finance', 'support']
        }],
        // Quién puede cambiar el estado
        statusChangePermissions: [{
            type: String,
            enum: ['manager', 'admin', 'logistics']
        }],
        // Historial de cambios de autorización
        changeHistory: [{
            changedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            changedAt: {
                type: Date,
                default: Date.now
            },
            changeType: {
                type: String,
                enum: ['created', 'modified', 'cancelled', 'refunded', 'status_changed']
            },
            previousValue: mongoose.Schema.Types.Mixed,
            newValue: mongoose.Schema.Types.Mixed,
            reason: String
        }]
    },
    // Cupones aplicados
    coupons: [{
        code: String,
        discount: Number,
        type: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: 'percentage'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Notas y comentarios
    notes: {
        customer: String,
        internal: String,
        shipping: String
    },
    // Configuración de notificaciones
    notifications: {
        emailSent: {
            confirmation: { type: Boolean, default: false },
            shipped: { type: Boolean, default: false },
            delivered: { type: Boolean, default: false },
            cancelled: { type: Boolean, default: false },
            refunded: { type: Boolean, default: false }
        },
        smsSent: {
            confirmation: { type: Boolean, default: false },
            shipped: { type: Boolean, default: false },
            delivered: { type: Boolean, default: false }
        }
    },
    // Información de auditoría
    audit: {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        modifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        refundedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        ipAddress: String,
        userAgent: String
    }
}, {
    timestamps: true
});

// Índices para optimizar consultas
orderSchema.index({ 'customer.id': 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'pricing.total': -1 });

// Generar número de orden único
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `ORD-${year}${month}${day}-${random}`;
    }
    next();
});

// Método para verificar si un usuario puede ver esta orden
orderSchema.methods.canView = function(user) {
    if (!user) return false;
    
    // El cliente siempre puede ver su propia orden
    if (this.customer.id.toString() === user._id.toString()) {
        return true;
    }
    
    // Verificar permisos de autorización
    return this.authorization.viewPermissions.includes(user.role);
};

// Método para verificar si un usuario puede editar esta orden
orderSchema.methods.canEdit = function(user) {
    if (!user) return false;
    
    // Solo usuarios con permisos de edición pueden modificar
    return this.authorization.editPermissions.includes(user.role);
};

// Método para verificar si un usuario puede cancelar esta orden
orderSchema.methods.canCancel = function(user) {
    if (!user) return false;
    
    // El cliente puede cancelar si la orden está pendiente
    if (this.customer.id.toString() === user._id.toString()) {
        return ['pending', 'paid'].includes(this.status);
    }
    
    // Verificar permisos de cancelación
    return this.authorization.cancelPermissions.includes(user.role);
};

// Método para verificar si un usuario puede procesar reembolsos
orderSchema.methods.canProcessRefund = function(user) {
    if (!user) return false;
    
    return this.authorization.refundPermissions.includes(user.role);
};

// Método para verificar si un usuario puede cambiar el estado
orderSchema.methods.canChangeStatus = function(user) {
    if (!user) return false;
    
    return this.authorization.statusChangePermissions.includes(user.role);
};

// Método para cambiar el estado de la orden
orderSchema.methods.changeStatus = function(newStatus, user, reason = '') {
    const oldStatus = this.status;
    this.status = newStatus;
    
    // Registrar el cambio
    this.authorization.changeHistory.push({
        changedBy: user._id,
        changedAt: new Date(),
        changeType: 'status_changed',
        previousValue: oldStatus,
        newValue: newStatus,
        reason: reason
    });
    
    // Actualizar auditoría
    this.audit.modifiedBy = user._id;
    
    return this.save();
};

// Método para cancelar la orden
orderSchema.methods.cancel = function(user, reason = '') {
    this.status = 'cancelled';
    
    // Registrar el cambio
    this.authorization.changeHistory.push({
        changedBy: user._id,
        changedAt: new Date(),
        changeType: 'cancelled',
        previousValue: this.status,
        newValue: 'cancelled',
        reason: reason
    });
    
    // Actualizar auditoría
    this.audit.cancelledBy = user._id;
    
    return this.save();
};

// Método para procesar reembolso
orderSchema.methods.processRefund = function(user, amount, reason = '') {
    this.payment.status = 'refunded';
    this.payment.refundedAt = new Date();
    this.payment.refundAmount = amount;
    this.status = 'refunded';
    
    // Registrar el cambio
    this.authorization.changeHistory.push({
        changedBy: user._id,
        changedAt: new Date(),
        changeType: 'refunded',
        previousValue: this.payment.status,
        newValue: 'refunded',
        reason: reason
    });
    
    // Actualizar auditoría
    this.audit.refundedBy = user._id;
    
    return this.save();
};

// Método para calcular el total de la orden
orderSchema.methods.calculateTotal = function() {
    const subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = this.pricing.tax;
    const shipping = this.pricing.shipping;
    const discount = this.pricing.discount;
    
    this.pricing.subtotal = subtotal;
    this.pricing.total = subtotal + tax + shipping - discount;
    
    return this.pricing.total;
};

// Método para aplicar descuento de rol
orderSchema.methods.applyRoleDiscount = function(user) {
    const roleDiscount = user.getRoleDiscount();
    if (roleDiscount > 0) {
        const discountAmount = (this.pricing.subtotal * roleDiscount) / 100;
        this.pricing.discount += discountAmount;
        this.calculateTotal();
    }
    return this;
};

// Método para verificar límites de compra
orderSchema.methods.checkPurchaseLimits = function(user) {
    const limits = user.getPurchaseLimits();
    const totalValue = this.pricing.total;
    const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalValue > limits.maxOrderValue) {
        throw new Error(`El valor máximo de orden para tu rol es $${limits.maxOrderValue}`);
    }
    
    if (totalItems > limits.maxItems) {
        throw new Error(`El máximo de items para tu rol es ${limits.maxItems}`);
    }
    
    return true;
};

// Método para obtener información pública de la orden
orderSchema.methods.getPublicInfo = function() {
    return {
        id: this._id,
        orderNumber: this.orderNumber,
        status: this.status,
        customer: {
            name: this.customer.name,
            email: this.customer.email
        },
        items: this.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal
        })),
        pricing: this.pricing,
        payment: {
            method: this.payment.method,
            status: this.payment.status
        },
        shipping: {
            method: this.shipping.method,
            trackingNumber: this.shipping.trackingNumber,
            estimatedDelivery: this.shipping.estimatedDelivery
        },
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

// Método para obtener información detallada (solo para usuarios autorizados)
orderSchema.methods.getDetailedInfo = function(user) {
    if (!this.canView(user)) {
        throw new Error('No tienes permisos para ver esta orden');
    }
    
    return {
        ...this.getPublicInfo(),
        notes: this.notes,
        coupons: this.coupons,
        audit: this.audit,
        authorization: {
            viewPermissions: this.authorization.viewPermissions,
            editPermissions: this.authorization.editPermissions,
            cancelPermissions: this.authorization.cancelPermissions,
            refundPermissions: this.authorization.refundPermissions,
            statusChangePermissions: this.authorization.statusChangePermissions
        }
    };
};

// Método estático para crear una nueva orden
orderSchema.statics.createOrder = async function(orderData, user) {
    const order = new this({
        customer: {
            id: user._id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            phone: user.contact?.phone,
            address: user.contact?.address
        },
        items: orderData.items,
        payment: {
            method: orderData.paymentMethod
        },
        shipping: {
            method: orderData.shippingMethod,
            cost: orderData.shippingCost
        },
        notes: orderData.notes,
        audit: {
            createdBy: user._id,
            ipAddress: orderData.ipAddress,
            userAgent: orderData.userAgent
        }
    });
    
    // Configurar permisos de autorización basados en el rol del usuario
    order.authorization = {
        viewPermissions: ['customer', 'premium', 'vip', 'seller', 'manager', 'admin', 'support', 'finance', 'logistics'],
        editPermissions: ['manager', 'admin', 'support'],
        cancelPermissions: ['customer', 'manager', 'admin', 'support'],
        refundPermissions: ['manager', 'admin', 'finance', 'support'],
        statusChangePermissions: ['manager', 'admin', 'logistics'],
        changeHistory: []
    };
    
    // Calcular totales
    order.calculateTotal();
    
    // Aplicar descuento de rol
    order.applyRoleDiscount(user);
    
    // Verificar límites de compra
    order.checkPurchaseLimits(user);
    
    return order.save();
};

module.exports = mongoose.model('Order', orderSchema); 