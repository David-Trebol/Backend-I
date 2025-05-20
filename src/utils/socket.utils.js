let io;

const initSocket = (socketIO) => {
    io = socketIO;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io no está inicializado');
    }
    return io;
};

const emitProductAdded = (product) => {
    if (io) {
        io.emit('productAdded', product);
    }
};

const emitProductDeleted = (productId) => {
    if (io) {
        io.emit('productDeleted', productId);
    }
};

module.exports = {
    initSocket,
    getIO,
    emitProductAdded,
    emitProductDeleted
};