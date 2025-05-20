const express = require('express');
const path = require('path');

const configMiddleware = (app) => {
    // Middleware para parsear JSON
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Middleware para archivos estáticos
    app.use(express.static(path.join(__dirname, '../public')));

    // Middleware para manejo de errores
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    });
};

module.exports = configMiddleware; 