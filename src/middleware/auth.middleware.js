const { verifyToken } = require('../utils/jwt.utils');
const UserDTO = require('../dtos/UserDTO');

// Middleware para verificar token y agregar usuario al request
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const tokenData = verifyToken(token);
        const userDTO = UserDTO.fromToken(tokenData);
        
        // Agregar usuario al request sin información sensible
        req.user = userDTO;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// Middleware para obtener usuario completo desde base de datos
const authenticateAndGetUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const tokenData = verifyToken(token);
        
        // Obtener usuario completo desde base de datos
        const UserManager = require('../managers/UserManager');
        const userManager = new UserManager();
        const user = await userManager.getUserById(tokenData.id);
        
        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        // Crear DTO con información completa pero sin datos sensibles
        const userDTO = UserDTO.fromUser(user);
        
        // Agregar usuario al request
        req.user = userDTO;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// Middleware para verificar rol específico
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        next();
    };
};

// Middleware para verificar si es admin
const requireAdmin = requireRole(['admin']);

// Middleware para verificar si es usuario o admin
const requireUser = requireRole(['user', 'admin']);

module.exports = {
    authenticateToken,
    authenticateAndGetUser,
    requireRole,
    requireAdmin,
    requireUser
}; 