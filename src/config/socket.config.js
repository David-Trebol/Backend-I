const ProductManager = require('../managers/ProductManager');

const configSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Cliente conectado');

        socket.on('deleteProduct', async (productId) => {
            try {
                const productManager = new ProductManager();
                await productManager.deleteProduct(productId);
                io.emit('productDeleted', productId);
            } catch (error) {
                console.error('Error al eliminar producto:', error);
                socket.emit('error', { message: 'Error al eliminar el producto' });
            }
        });

        socket.on('disconnect', () => {
            console.log('Cliente desconectado');
        });
    });
};

module.exports = configSocket;