// Configuración global para los tests
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Mock de console.log para evitar spam en los tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Timeout global para tests
jest.setTimeout(10000);
