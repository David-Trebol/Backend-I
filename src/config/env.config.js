const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce',
    sessionSecret: process.env.SESSION_SECRET || 'your-secret-key'
};

module.exports = config; 