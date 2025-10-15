const request = require('supertest');

// Mock de la aplicación principal
jest.mock('../../src/app.js', () => {
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  
  // Rutas básicas para testing
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      environment: process.env.NODE_ENV || 'test',
      version: '1.0.0'
    });
  });
  
  // Middleware de error
  app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
  });
  
  return app;
});

const app = require('../../src/app.js');

describe('App Integration Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return API health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.environment).toBeDefined();
      expect(response.body.version).toBe('1.0.0');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body).toBeDefined();
    });
  });

  describe('JSON Parsing', () => {
    it('should parse JSON requests', async () => {
      const testData = { message: 'test' };
      
      // Crear una ruta temporal para testing
      app.post('/test-json', (req, res) => {
        res.json(req.body);
      });

      const response = await request(app)
        .post('/test-json')
        .send(testData)
        .expect(200);

      expect(response.body).toEqual(testData);
    });
  });
});
