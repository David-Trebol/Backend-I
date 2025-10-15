const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    adopterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adoptionDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'completed', 'cancelled'],
        default: 'pending',
        required: true
    },
    notes: {
        type: String,
        maxLength: 1000
    },
    adoptionFee: {
        type: Number,
        min: 0,
        default: 0
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    cancellationReason: {
        type: String,
        maxLength: 500
    }
}, {
    timestamps: true
});

// Índices para mejorar el rendimiento
adoptionSchema.index({ petId: 1, status: 1 });
adoptionSchema.index({ adopterId: 1, status: 1 });
adoptionSchema.index({ status: 1, createdAt: -1 });

// Métodos de instancia
adoptionSchema.methods.canBeApproved = function() {
    return this.status === 'pending';
};

adoptionSchema.methods.canBeCompleted = function() {
    return this.status === 'approved';
};

adoptionSchema.methods.canBeCancelled = function() {
    return ['pending', 'approved'].includes(this.status);
};

// Middleware pre-save para validaciones
adoptionSchema.pre('save', async function(next) {
    // Verificar que la mascota existe
    if (this.isNew) {
        const Pet = mongoose.model('Pet');
        const pet = await Pet.findById(this.petId);
        if (!pet) {
            const error = new Error('La mascota especificada no existe');
            return next(error);
        }
    }

    // Verificar que el adoptante existe
    if (this.isNew) {
        const User = mongoose.model('User');
        const user = await User.findById(this.adopterId);
        if (!user) {
            const error = new Error('El adoptante especificado no existe');
            return next(error);
        }
    }

    next();
});

// Middleware post-save para actualizar estado de la mascota
adoptionSchema.post('save', async function(doc) {
    if (doc.isModified('status')) {
        const Pet = mongoose.model('Pet');
        const pet = await Pet.findById(doc.petId);
        
        if (pet) {
            switch (doc.status) {
                case 'pending':
                case 'approved':
                    if (pet.status !== 'reserved') {
                        pet.status = 'reserved';
                        await pet.save();
                    }
                    break;
                case 'completed':
                    pet.status = 'adopted';
                    await pet.save();
                    break;
                case 'cancelled':
                    pet.status = 'available';
                    await pet.save();
                    break;
            }
        }
    }
});

module.exports = mongoose.model('Adoption', adoptionSchema);
