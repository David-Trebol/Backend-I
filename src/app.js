const express = require('express');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Importar rutas
const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');

// Rutas principales
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Puerto
const PORT = 8080;

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
}); 