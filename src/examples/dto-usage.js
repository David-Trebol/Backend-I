const UserDTO = require('../dtos/UserDTO');
const UserManager = require('../managers/UserManager');

// Ejemplo de uso de DTOs en diferentes contextos
async function ejemploUsoDTOs() {
    const userManager = new UserManager();

    try {
        console.log('=== Ejemplo de uso de DTOs ===\n');

        // 1. Crear un usuario de ejemplo
        console.log('1. Creando usuario de ejemplo...');
        const user = await userManager.addUser({
            first_name: 'Ana',
            last_name: 'García',
            email: 'ana@example.com',
            age: 28,
            password: 'password123'
        });

        console.log('Usuario creado:', user.first_name, user.last_name);

        // 2. Diferentes tipos de DTOs
        console.log('\n2. Creando diferentes tipos de DTOs...');

        // DTO completo desde usuario
        const userDTO = UserDTO.fromUser(user);
        console.log('DTO completo:', {
            id: userDTO.id,
            first_name: userDTO.first_name,
            last_name: userDTO.last_name,
            email: userDTO.email,
            role: userDTO.role
        });

        // DTO público (sin email)
        const publicDTO = UserDTO.toPublic(user);
        console.log('DTO público (sin email):', {
            id: publicDTO.id,
            first_name: publicDTO.first_name,
            last_name: publicDTO.last_name,
            role: publicDTO.role
        });

        // DTO básico
        const basicDTO = UserDTO.toBasic(user);
        console.log('DTO básico:', basicDTO);

        // DTO de perfil
        const profileDTO = UserDTO.toProfile(user);
        console.log('DTO de perfil:', {
            id: profileDTO.id,
            first_name: profileDTO.first_name,
            last_name: profileDTO.last_name,
            email: profileDTO.email,
            age: profileDTO.age,
            role: profileDTO.role
        });

        // DTO de autenticación
        const authDTO = UserDTO.toAuth(user);
        console.log('DTO de autenticación:', authDTO);

        // 3. Simular token JWT
        console.log('\n3. Simulando DTO desde token JWT...');
        const tokenData = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        const tokenDTO = UserDTO.fromToken(tokenData);
        console.log('DTO desde token:', tokenDTO);

        // 4. Comparar información sensible
        console.log('\n4. Comparando información sensible...');
        console.log('Usuario original (con password):', {
            _id: user._id,
            first_name: user.first_name,
            email: user.email,
            password: user.password ? '[PROTEGIDO]' : 'undefined',
            __v: user.__v
        });

        console.log('DTO (sin información sensible):', {
            id: userDTO.id,
            first_name: userDTO.first_name,
            email: userDTO.email,
            password: userDTO.password ? '[PROTEGIDO]' : 'undefined',
            __v: userDTO.__v
        });

        // 5. Ejemplo de respuesta API
        console.log('\n5. Ejemplo de respuesta API...');
        
        // Respuesta para perfil público
        const publicResponse = {
            message: 'Usuario encontrado',
            user: UserDTO.toPublic(user)
        };
        console.log('Respuesta pública:', publicResponse);

        // Respuesta para autenticación
        const authResponse = {
            message: 'Login exitoso',
            token: 'jwt_token_here',
            user: UserDTO.toAuth(user)
        };
        console.log('Respuesta de autenticación:', authResponse);

        // Respuesta para perfil completo
        const profileResponse = {
            message: 'Perfil del usuario',
            user: UserDTO.toProfile(user)
        };
        console.log('Respuesta de perfil:', profileResponse);

        console.log('\n=== Ejemplo completado exitosamente ===');

    } catch (error) {
        console.error('Error en el ejemplo:', error.message);
    }
}

// Ejemplo de middleware con DTOs
function ejemploMiddlewareDTO() {
    console.log('\n=== Ejemplo de Middleware con DTOs ===\n');

    // Simular request con token
    const mockRequest = {
        headers: {
            authorization: 'Bearer mock_jwt_token'
        }
    };

    const mockResponse = {
        status: (code) => ({
            json: (data) => console.log(`Status ${code}:`, data)
        }),
        json: (data) => console.log('Response:', data)
    };

    // Simular middleware de autenticación
    const authenticateAndGetUser = (req, res, next) => {
        try {
            // Simular verificación de token
            const tokenData = {
                id: '507f1f77bcf86cd799439011',
                email: 'usuario@example.com',
                role: 'user'
            };

            // Crear DTO desde token
            const userDTO = UserDTO.fromToken(tokenData);
            
            // Agregar usuario al request
            req.user = userDTO;
            
            console.log('Usuario agregado al request:', req.user);
            next();
        } catch (error) {
            res.status(401).json({ error: 'Token inválido' });
        }
    };

    // Simular ruta protegida
    const protectedRoute = (req, res) => {
        console.log('Accediendo a ruta protegida...');
        console.log('Usuario autenticado:', req.user);
        
        res.json({
            message: 'Ruta protegida accedida',
            user: req.user
        });
    };

    // Ejecutar ejemplo
    authenticateAndGetUser(mockRequest, mockResponse, () => {
        protectedRoute(mockRequest, mockResponse);
    });
}

// Exportar funciones
module.exports = {
    ejemploUsoDTOs,
    ejemploMiddlewareDTO
};

// Ejecutar ejemplos si el archivo se ejecuta directamente
if (require.main === module) {
    ejemploUsoDTOs()
        .then(() => ejemploMiddlewareDTO())
        .catch(console.error);
} 