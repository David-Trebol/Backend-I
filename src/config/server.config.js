const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const configHandlebars = require('./handlebars.config');
const configSocket = require('./socket.config');
const configMiddleware = require('./middleware.config');
const { initSocket } = require('../utils/socket.utils');

const initializeServer = () => {
    const app = express();
    const httpServer = createServer(app);
    const io = new Server(httpServer);

    // Inicializar Socket.IO
    initSocket(io);
    configSocket(io);

    // Configuración de Handlebars
    configHandlebars(app);

    // Configuración de middlewares
    configMiddleware(app);

    // Importar rutas
    const productsRouter = require('../routes/products.router');
    const cartsRouter = require('../routes/carts.router');
    const viewsRouter = require('../routes/views.router');
    const mocksRouter = require('../routes/mocks.router');

    // Rutas principales
    app.use('/api/products', productsRouter);
    app.use('/api/carts', cartsRouter);
    app.use('/', viewsRouter);
    app.use('/api/mocks', mocksRouter);

    return { app, httpServer };
};

module.exports = initializeServer; 