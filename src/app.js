const initializeServer = require('./config/server.config');
const config = require('./config/env.config');

// Inicializar servidor
const { httpServer } = initializeServer();

// Iniciar servidor
httpServer.listen(config.port, () => {
    console.log(`Servidor corriendo en el puerto ${config.port}`);
    console.log(`Ambiente: ${config.nodeEnv}`);
}); 