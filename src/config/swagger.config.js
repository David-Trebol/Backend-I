const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backend API - Sistema de E-commerce',
      version: '1.0.0',
      description: 'API completa para sistema de e-commerce con autenticación, productos, carritos y adopciones',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://your-production-url.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint de login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'age'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del usuario',
              example: '507f1f77bcf86cd799439011'
            },
            firstName: {
              type: 'string',
              description: 'Nombre del usuario',
              example: 'Juan'
            },
            lastName: {
              type: 'string',
              description: 'Apellido del usuario',
              example: 'Pérez'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'juan@example.com'
            },
            age: {
              type: 'integer',
              minimum: 0,
              maximum: 120,
              description: 'Edad del usuario',
              example: 25
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin'],
              description: 'Rol del usuario',
              example: 'customer'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              description: 'Estado de la cuenta',
              example: 'active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
              example: '2023-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        UserDTO: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID del usuario',
              example: '507f1f77bcf86cd799439011'
            },
            firstName: {
              type: 'string',
              example: 'Juan'
            },
            lastName: {
              type: 'string',
              example: 'Pérez'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'juan@example.com'
            },
            age: {
              type: 'integer',
              example: 25
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin'],
              example: 'customer'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              example: 'active'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'juan@example.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Contraseña del usuario',
              example: 'password123'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'age'],
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Nombre del usuario',
              example: 'Juan'
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Apellido del usuario',
              example: 'Pérez'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'juan@example.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              maxLength: 100,
              description: 'Contraseña del usuario',
              example: 'password123'
            },
            age: {
              type: 'integer',
              minimum: 0,
              maximum: 120,
              description: 'Edad del usuario',
              example: 25
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin'],
              description: 'Rol del usuario (opcional, por defecto: customer)',
              example: 'customer'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login exitoso'
            },
            token: {
              type: 'string',
              description: 'Token JWT para autenticación',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              $ref: '#/components/schemas/UserDTO'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'Usuario no encontrado'
            },
            details: {
              type: 'string',
              description: 'Detalles adicionales del error',
              example: 'El usuario con ID 507f1f77bcf86cd799439011 no existe'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de éxito',
              example: 'Operación realizada exitosamente'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso no proporcionado o inválido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                error: 'Token no proporcionado'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acceso denegado - permisos insuficientes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                error: 'Acceso denegado',
                details: 'No tienes permisos para realizar esta acción'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                error: 'Usuario no encontrado'
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación en los datos enviados',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                error: 'Datos de entrada inválidos',
                details: 'El email debe ser válido y la contraseña debe tener al menos 6 caracteres'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/userRoutes.js',
    './src/routes/authRoutes.js',
    './src/routes/adoptionRoutes.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = specs;
