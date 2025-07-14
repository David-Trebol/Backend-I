const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'jwtSuperSecreto';

const generateToken = (user) => {
    return jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role
    }, SECRET, { expiresIn: '1h' });
};

const verifyToken = (token) => {
    return jwt.verify(token, SECRET);
};

module.exports = {
    generateToken,
    verifyToken
}; 