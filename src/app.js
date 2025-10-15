const initializeServer = require('./config/server.config');
const config = require('./config/env.config');
const setupSwagger = require('./config/swagger-setup');

// Inicializar servidor
const { app, httpServer } = initializeServer();

// Configurar Swagger
setupSwagger(app);

// Iniciar servidor
httpServer.listen(config.port, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${config.port}`);
    console.log(`🌍 Ambiente: ${config.nodeEnv}`);
    console.log(`📚 Documentación API: http://localhost:${config.port}/api-docs`);
});

module.exports = { app, httpServer }; 