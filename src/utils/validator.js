const Joi = require('joi');
const config = require('../config/environment.config');
const { log } = require('./logger');

// Esquemas de validación
const schemas = {
    // Usuario
    user: {
        create: Joi.object({
            first_name: Joi.string().min(2).max(50).required()
                .messages({
                    'string.min': 'El nombre debe tener al menos 2 caracteres',
                    'string.max': 'El nombre no puede exceder 50 caracteres',
                    'any.required': 'El nombre es requerido'
                }),
            last_name: Joi.string().min(2).max(50).required()
                .messages({
                    'string.min': 'El apellido debe tener al menos 2 caracteres',
                    'string.max': 'El apellido no puede exceder 50 caracteres',
                    'any.required': 'El apellido es requerido'
                }),
            email: Joi.string().email().required()
                .messages({
                    'string.email': 'El email debe tener un formato válido',
                    'any.required': 'El email es requerido'
                }),
            age: Joi.number().integer().min(18).max(120).required()
                .messages({
                    'number.base': 'La edad debe ser un número',
                    'number.integer': 'La edad debe ser un número entero',
                    'number.min': 'La edad mínima es 18 años',
                    'number.max': 'La edad máxima es 120 años',
                    'any.required': 'La edad es requerida'
                }),
            password: Joi.string()
                .min(config.get('validation.password.minLength'))
                .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
                .required()
                .messages({
                    'string.min': `La contraseña debe tener al menos ${config.get('validation.password.minLength')} caracteres`,
                    'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
                    'any.required': 'La contraseña es requerida'
                }),
            role: Joi.string().valid('user', 'admin').default('user')
                .messages({
                    'any.only': 'El rol debe ser "user" o "admin"'
                })
        }),

        update: Joi.object({
            first_name: Joi.string().min(2).max(50)
                .messages({
                    'string.min': 'El nombre debe tener al menos 2 caracteres',
                    'string.max': 'El nombre no puede exceder 50 caracteres'
                }),
            last_name: Joi.string().min(2).max(50)
                .messages({
                    'string.min': 'El apellido debe tener al menos 2 caracteres',
                    'string.max': 'El apellido no puede exceder 50 caracteres'
                }),
            email: Joi.string().email()
                .messages({
                    'string.email': 'El email debe tener un formato válido'
                }),
            age: Joi.number().integer().min(18).max(120)
                .messages({
                    'number.base': 'La edad debe ser un número',
                    'number.integer': 'La edad debe ser un número entero',
                    'number.min': 'La edad mínima es 18 años',
                    'number.max': 'La edad máxima es 120 años'
                }),
            role: Joi.string().valid('user', 'admin')
                .messages({
                    'any.only': 'El rol debe ser "user" o "admin"'
                })
        }),

        login: Joi.object({
            email: Joi.string().email().required()
                .messages({
                    'string.email': 'El email debe tener un formato válido',
                    'any.required': 'El email es requerido'
                }),
            password: Joi.string().required()
                .messages({
                    'any.required': 'La contraseña es requerida'
                })
        })
    },

    // Producto
    product: {
        create: Joi.object({
            title: Joi.string().min(3).max(100).required()
                .messages({
                    'string.min': 'El título debe tener al menos 3 caracteres',
                    'string.max': 'El título no puede exceder 100 caracteres',
                    'any.required': 'El título es requerido'
                }),
            description: Joi.string().min(10).max(500).required()
                .messages({
                    'string.min': 'La descripción debe tener al menos 10 caracteres',
                    'string.max': 'La descripción no puede exceder 500 caracteres',
                    'any.required': 'La descripción es requerida'
                }),
            code: Joi.string().alphanum().min(3).max(20).required()
                .messages({
                    'string.alphanum': 'El código debe contener solo letras y números',
                    'string.min': 'El código debe tener al menos 3 caracteres',
                    'string.max': 'El código no puede exceder 20 caracteres',
                    'any.required': 'El código es requerido'
                }),
            price: Joi.number().positive().precision(2).required()
                .messages({
                    'number.base': 'El precio debe ser un número',
                    'number.positive': 'El precio debe ser positivo',
                    'number.precision': 'El precio debe tener máximo 2 decimales',
                    'any.required': 'El precio es requerido'
                }),
            stock: Joi.number().integer().min(0).required()
                .messages({
                    'number.base': 'El stock debe ser un número',
                    'number.integer': 'El stock debe ser un número entero',
                    'number.min': 'El stock no puede ser negativo',
                    'any.required': 'El stock es requerido'
                }),
            category: Joi.string().min(2).max(50).required()
                .messages({
                    'string.min': 'La categoría debe tener al menos 2 caracteres',
                    'string.max': 'La categoría no puede exceder 50 caracteres',
                    'any.required': 'La categoría es requerida'
                }),
            thumbnails: Joi.array().items(Joi.string().uri()).optional()
                .messages({
                    'array.base': 'Las imágenes deben ser un array',
                    'string.uri': 'Las URLs de las imágenes deben ser válidas'
                })
        }),

        update: Joi.object({
            title: Joi.string().min(3).max(100)
                .messages({
                    'string.min': 'El título debe tener al menos 3 caracteres',
                    'string.max': 'El título no puede exceder 100 caracteres'
                }),
            description: Joi.string().min(10).max(500)
                .messages({
                    'string.min': 'La descripción debe tener al menos 10 caracteres',
                    'string.max': 'La descripción no puede exceder 500 caracteres'
                }),
            code: Joi.string().alphanum().min(3).max(20)
                .messages({
                    'string.alphanum': 'El código debe contener solo letras y números',
                    'string.min': 'El código debe tener al menos 3 caracteres',
                    'string.max': 'El código no puede exceder 20 caracteres'
                }),
            price: Joi.number().positive().precision(2)
                .messages({
                    'number.base': 'El precio debe ser un número',
                    'number.positive': 'El precio debe ser positivo',
                    'number.precision': 'El precio debe tener máximo 2 decimales'
                }),
            stock: Joi.number().integer().min(0)
                .messages({
                    'number.base': 'El stock debe ser un número',
                    'number.integer': 'El stock debe ser un número entero',
                    'number.min': 'El stock no puede ser negativo'
                }),
            category: Joi.string().min(2).max(50)
                .messages({
                    'string.min': 'La categoría debe tener al menos 2 caracteres',
                    'string.max': 'La categoría no puede exceder 50 caracteres'
                }),
            thumbnails: Joi.array().items(Joi.string().uri())
                .messages({
                    'array.base': 'Las imágenes deben ser un array',
                    'string.uri': 'Las URLs de las imágenes deben ser válidas'
                })
        })
    },

    // Carrito
    cart: {
        addProduct: Joi.object({
            quantity: Joi.number().integer().min(1).max(100).default(1)
                .messages({
                    'number.base': 'La cantidad debe ser un número',
                    'number.integer': 'La cantidad debe ser un número entero',
                    'number.min': 'La cantidad mínima es 1',
                    'number.max': 'La cantidad máxima es 100'
                })
        }),

        updateQuantity: Joi.object({
            quantity: Joi.number().integer().min(0).max(100).required()
                .messages({
                    'number.base': 'La cantidad debe ser un número',
                    'number.integer': 'La cantidad debe ser un número entero',
                    'number.min': 'La cantidad no puede ser negativa',
                    'number.max': 'La cantidad máxima es 100',
                    'any.required': 'La cantidad es requerida'
                })
        })
    },

    // Password Reset
    passwordReset: {
        request: Joi.object({
            email: Joi.string().email().required()
                .messages({
                    'string.email': 'El email debe tener un formato válido',
                    'any.required': 'El email es requerido'
                })
        }),

        reset: Joi.object({
            token: Joi.string().required()
                .messages({
                    'any.required': 'El token es requerido'
                }),
            newPassword: Joi.string()
                .min(config.get('validation.password.minLength'))
                .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
                .required()
                .messages({
                    'string.min': `La contraseña debe tener al menos ${config.get('validation.password.minLength')} caracteres`,
                    'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
                    'any.required': 'La nueva contraseña es requerida'
                }),
            confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
                .messages({
                    'any.only': 'Las contraseñas no coinciden',
                    'any.required': 'La confirmación de contraseña es requerida'
                })
        })
    },

    // Query Parameters
    query: {
        pagination: Joi.object({
            page: Joi.number().integer().min(1).default(1)
                .messages({
                    'number.base': 'La página debe ser un número',
                    'number.integer': 'La página debe ser un número entero',
                    'number.min': 'La página mínima es 1'
                }),
            limit: Joi.number().integer().min(1).max(100).default(10)
                .messages({
                    'number.base': 'El límite debe ser un número',
                    'number.integer': 'El límite debe ser un número entero',
                    'number.min': 'El límite mínimo es 1',
                    'number.max': 'El límite máximo es 100'
                }),
            sort: Joi.string().valid('asc', 'desc').default('asc')
                .messages({
                    'any.only': 'El orden debe ser "asc" o "desc"'
                })
        }),

        filters: Joi.object({
            category: Joi.string().min(2).max(50)
                .messages({
                    'string.min': 'La categoría debe tener al menos 2 caracteres',
                    'string.max': 'La categoría no puede exceder 50 caracteres'
                }),
            minPrice: Joi.number().positive()
                .messages({
                    'number.base': 'El precio mínimo debe ser un número',
                    'number.positive': 'El precio mínimo debe ser positivo'
                }),
            maxPrice: Joi.number().positive()
                .messages({
                    'number.base': 'El precio máximo debe ser un número',
                    'number.positive': 'El precio máximo debe ser positivo'
                }),
            inStock: Joi.boolean()
                .messages({
                    'boolean.base': 'El filtro de stock debe ser true o false'
                })
        })
    }
};

// Función para validar datos
const validate = (schema, data, options = {}) => {
    try {
        const { error, value } = schema.validate(data, {
            abortEarly: false,
            allowUnknown: options.allowUnknown || false,
            stripUnknown: options.stripUnknown || true,
            ...options
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                type: detail.type
            }));

            log.warn('Validation failed', {
                schema: schema.describe().keys ? Object.keys(schema.describe().keys) : 'unknown',
                errors: errors.length,
                data: options.logData ? data : undefined
            });

            return {
                isValid: false,
                errors,
                value: null
            };
        }

        log.debug('Validation successful', {
            schema: schema.describe().keys ? Object.keys(schema.describe().keys) : 'unknown'
        });

        return {
            isValid: true,
            errors: [],
            value
        };
    } catch (error) {
        log.error('Validation error', {
            error: error.message,
            schema: schema.describe().keys ? Object.keys(schema.describe().keys) : 'unknown'
        });

        return {
            isValid: false,
            errors: [{
                field: 'validation',
                message: 'Error interno de validación',
                type: 'internal'
            }],
            value: null
        };
    }
};

// Middleware para validar requests
const validateRequest = (schema, options = {}) => {
    return (req, res, next) => {
        const data = {
            ...req.body,
            ...req.query,
            ...req.params
        };

        const result = validate(schema, data, options);

        if (!result.isValid) {
            return res.status(400).json({
                error: 'Datos de entrada inválidos',
                details: result.errors,
                timestamp: new Date().toISOString()
            });
        }

        // Reemplazar datos con los validados
        req.validatedData = result.value;
        next();
    };
};

// Función para validar contraseña
const validatePassword = (password) => {
    const passwordSchema = schemas.user.create.extract('password');
    return validate(passwordSchema, { password });
};

// Función para validar email
const validateEmail = (email) => {
    const emailSchema = Joi.string().email();
    return validate(emailSchema, email);
};

// Función para sanitizar datos
const sanitize = (data, schema) => {
    const result = validate(schema, data, { stripUnknown: true });
    return result.isValid ? result.value : data;
};

// Función para validar ID de MongoDB
const validateObjectId = (id) => {
    const objectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);
    return validate(objectIdSchema, id);
};

module.exports = {
    schemas,
    validate,
    validateRequest,
    validatePassword,
    validateEmail,
    sanitize,
    validateObjectId
}; 