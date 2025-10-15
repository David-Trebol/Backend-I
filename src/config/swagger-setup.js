const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger.config');

const setupSwagger = (app) => {
    // Configurar Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Backend API - Documentación',
        customfavIcon: '/favicon.ico',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            showExtensions: true,
            showCommonExtensions: true
        }
    }));

    // Ruta para obtener el JSON de Swagger
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpecs);
    });

    // Ruta de redirección desde la raíz de docs
    app.get('/docs', (req, res) => {
        res.redirect('/api-docs');
    });

    console.log('📚 Swagger UI disponible en: http://localhost:3000/api-docs');
    console.log('📄 Swagger JSON disponible en: http://localhost:3000/api-docs.json');
};

module.exports = setupSwagger;
