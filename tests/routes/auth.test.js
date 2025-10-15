const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/authRoutes');

// Mock dependencies
jest.mock('../../src/managers/UserManager');
jest.mock('../../src/utils/hash.utils');
jest.mock('../../src/utils/jwt.utils');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    role: 'customer'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const UserManager = require('../../src/managers/UserManager');
      UserManager.prototype.addUser = jest.fn().mockResolvedValue(mockUser);

      const userData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        password: 'password123',
        age: 25,
        role: 'customer'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('Usuario registrado exitosamente');
      expect(response.body.user).toBeDefined();
      expect(UserManager.prototype.addUser).toHaveBeenCalledWith(userData);
    });

    it('should handle registration errors', async () => {
      const UserManager = require('../../src/managers/UserManager');
      UserManager.prototype.addUser = jest.fn().mockRejectedValue(new Error('Email already exists'));

      const userData = {
        email: 'existing@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const UserManager = require('../../src/managers/UserManager');
      const { comparePassword } = require('../../src/utils/hash.utils');
      const { generateToken } = require('../../src/utils/jwt.utils');

      UserManager.prototype.getUserByEmail = jest.fn().mockResolvedValue(mockUser);
      comparePassword.mockReturnValue(true);
      generateToken.mockReturnValue('mock-jwt-token');

      const loginData = {
        email: 'juan@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login exitoso');
      expect(response.body.token).toBe('mock-jwt-token');
      expect(response.body.user).toBeDefined();
    });

    it('should reject login with invalid email', async () => {
      const UserManager = require('../../src/managers/UserManager');
      UserManager.prototype.getUserByEmail = jest.fn().mockResolvedValue(null);

      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Credenciales inválidas');
    });

    it('should reject login with invalid password', async () => {
      const UserManager = require('../../src/managers/UserManager');
      const { comparePassword } = require('../../src/utils/hash.utils');

      UserManager.prototype.getUserByEmail = jest.fn().mockResolvedValue(mockUser);
      comparePassword.mockReturnValue(false);

      const loginData = {
        email: 'juan@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Credenciales inválidas');
    });
  });

  describe('GET /api/auth/current', () => {
    it('should get current user with valid token', async () => {
      const mockReq = {
        user: {
          id: mockUser._id,
          email: mockUser.email,
          role: mockUser.role
        }
      };

      // Mock the middleware
      const authMiddleware = require('../../src/middleware/auth.middleware');
      authMiddleware.authenticateAndGetUser = jest.fn((req, res, next) => {
        req.user = mockReq.user;
        next();
      });

      const response = await request(app)
        .get('/api/auth/current')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.message).toBe('Usuario autenticado');
      expect(response.body.user).toBeDefined();
    });
  });
});
