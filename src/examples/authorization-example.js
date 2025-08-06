const UserManager = require('../managers/UserManager');
const ProductManager = require('../managers/ProductManager');
const CartManager = require('../managers/CartManager');

// Ejemplo de uso del sistema de autorización
async function ejemploAutorizacion() {
    const userManager = new UserManager();
    const productManager = new ProductManager();
    const cartManager = new CartManager();

    try {
        console.log('=== Ejemplo de Sistema de Autorización ===\n');

        // 1. Crear usuarios con diferentes roles
        console.log('1. Creando usuarios con diferentes roles...');
        
        const adminUser = await userManager.addUser({
            first_name: 'Admin',
            last_name: 'Sistema',
            email: 'admin@example.com',
            age: 30,
            password: 'admin123',
            role: 'admin'
        });

        const normalUser = await userManager.addUser({
            first_name: 'Usuario',
            last_name: 'Normal',
            email: 'usuario@example.com',
            age: 25,
            password: 'user123',
            role: 'user'
        });

        console.log('Admin creado:', adminUser.email, `(${adminUser.role})`);
        console.log('Usuario creado:', normalUser.email, `(${normalUser.role})`);

        // 2. Crear productos (solo admin puede hacerlo)
        console.log('\n2. Creando productos (solo admin puede hacerlo)...');
        
        const producto1 = await productManager.addProduct({
            title: 'Laptop Gaming',
            description: 'Laptop para gaming de alto rendimiento',
            code: 'LAP001',
            price: 1500,
            stock: 10,
            category: 'Electrónicos',
            thumbnails: ['laptop1.jpg']
        });

        const producto2 = await productManager.addProduct({
            title: 'Mouse Inalámbrico',
            description: 'Mouse gaming inalámbrico',
            code: 'MOU001',
            price: 50,
            stock: 25,
            category: 'Accesorios',
            thumbnails: ['mouse1.jpg']
        });

        console.log('Productos creados:', producto1.title, producto2.title);

        // 3. Simular operaciones con diferentes roles
        console.log('\n3. Simulando operaciones con diferentes roles...');

        // Simular operaciones de admin
        console.log('\n--- Operaciones de ADMIN ---');
        console.log('✅ Admin puede crear productos');
        console.log('✅ Admin puede actualizar productos');
        console.log('✅ Admin puede eliminar productos');
        console.log('✅ Admin puede ver todos los carritos');
        console.log('✅ Admin puede agregar productos a cualquier carrito');

        // Simular operaciones de usuario
        console.log('\n--- Operaciones de USUARIO ---');
        console.log('❌ Usuario NO puede crear productos');
        console.log('❌ Usuario NO puede actualizar productos');
        console.log('❌ Usuario NO puede eliminar productos');
        console.log('✅ Usuario puede ver su propio carrito');
        console.log('✅ Usuario puede agregar productos a su carrito');
        console.log('✅ Usuario puede remover productos de su carrito');

        // 4. Simular intentos de acceso denegado
        console.log('\n4. Simulando intentos de acceso denegado...');

        const intentosAcceso = [
            {
                usuario: 'usuario@example.com',
                rol: 'user',
                operacion: 'POST /api/products',
                resultado: '❌ ACCESO DENEGADO - Solo admin puede crear productos'
            },
            {
                usuario: 'usuario@example.com',
                rol: 'user',
                operacion: 'PUT /api/products/123',
                resultado: '❌ ACCESO DENEGADO - Solo admin puede actualizar productos'
            },
            {
                usuario: 'usuario@example.com',
                rol: 'user',
                operacion: 'DELETE /api/products/123',
                resultado: '❌ ACCESO DENEGADO - Solo admin puede eliminar productos'
            },
            {
                usuario: 'admin@example.com',
                rol: 'admin',
                operacion: 'POST /api/carts/current/product/123',
                resultado: '✅ ACCESO PERMITIDO - Admin puede agregar productos'
            },
            {
                usuario: 'usuario@example.com',
                rol: 'user',
                operacion: 'POST /api/carts/current/product/123',
                resultado: '✅ ACCESO PERMITIDO - Usuario puede agregar productos a su carrito'
            }
        ];

        intentosAcceso.forEach(intento => {
            console.log(`\n👤 ${intento.usuario} (${intento.rol})`);
            console.log(`🔗 ${intento.operacion}`);
            console.log(`📋 ${intento.resultado}`);
        });

        // 5. Mostrar permisos por rol
        console.log('\n5. Permisos por rol:');
        
        const permisos = {
            admin: {
                productos: ['create', 'read', 'update', 'delete'],
                carritos: ['view_all', 'add', 'remove', 'update'],
                usuarios: ['read', 'update', 'delete']
            },
            user: {
                productos: ['read'],
                carritos: ['view_own', 'add', 'remove', 'update'],
                usuarios: ['read_own', 'update_own']
            }
        };

        Object.entries(permisos).forEach(([rol, permisosRol]) => {
            console.log(`\n👑 Rol: ${rol.toUpperCase()}`);
            Object.entries(permisosRol).forEach(([recurso, operaciones]) => {
                console.log(`  📦 ${recurso}: ${operaciones.join(', ')}`);
            });
        });

        // 6. Simular auditoría
        console.log('\n6. Simulando auditoría...');
        
        const eventosAuditoria = [
            {
                timestamp: new Date().toISOString(),
                operation: 'create',
                resource: 'product',
                user: { email: 'admin@example.com', role: 'admin' },
                method: 'POST',
                path: '/api/products',
                statusCode: 201,
                duration: '45ms'
            },
            {
                timestamp: new Date().toISOString(),
                operation: 'add',
                resource: 'cart',
                user: { email: 'usuario@example.com', role: 'user' },
                method: 'POST',
                path: '/api/carts/current/product/123',
                statusCode: 200,
                duration: '32ms'
            },
            {
                timestamp: new Date().toISOString(),
                operation: 'create',
                resource: 'product',
                user: { email: 'usuario@example.com', role: 'user' },
                method: 'POST',
                path: '/api/products',
                statusCode: 403,
                duration: '15ms',
                error: 'Acceso denegado'
            }
        ];

        eventosAuditoria.forEach(evento => {
            const icono = evento.statusCode >= 200 && evento.statusCode < 300 ? '✅' : '❌';
            console.log(`${icono} ${evento.operation} ${evento.resource} - ${evento.user.email} (${evento.statusCode})`);
        });

        console.log('\n=== Ejemplo completado exitosamente ===');

    } catch (error) {
        console.error('Error en el ejemplo:', error.message);
    }
}

// Ejemplo de configuración de permisos
function ejemploConfiguracionPermisos() {
    console.log('\n=== Configuración de Permisos ===\n');

    console.log('🔐 Permisos por Endpoint:');
    console.log('');
    console.log('📦 PRODUCTOS:');
    console.log('  GET    /api/products          - Público (lectura)');
    console.log('  GET    /api/products/:id      - Público (lectura)');
    console.log('  POST   /api/products          - Solo ADMIN');
    console.log('  PUT    /api/products/:id      - Solo ADMIN');
    console.log('  DELETE /api/products/:id      - Solo ADMIN');
    console.log('');
    console.log('🛒 CARRITOS:');
    console.log('  GET    /api/carts             - Solo ADMIN');
    console.log('  GET    /api/carts/:id         - Propietario o ADMIN');
    console.log('  POST   /api/carts             - Usuario autenticado');
    console.log('  POST   /api/carts/:id/product/:pid - Propietario o ADMIN');
    console.log('  DELETE /api/carts/:id/product/:pid - Propietario o ADMIN');
    console.log('  GET    /api/carts/current     - Usuario autenticado');
    console.log('');
    console.log('👥 USUARIOS:');
    console.log('  GET    /api/users             - Solo ADMIN');
    console.log('  GET    /api/users/:id         - Propietario o ADMIN');
    console.log('  PUT    /api/users/:id         - Propietario o ADMIN');
    console.log('  DELETE /api/users/:id         - Solo ADMIN');
}

// Ejemplo de respuestas de error
function ejemploRespuestasError() {
    console.log('\n=== Respuestas de Error ===\n');

    console.log('🚫 401 - No autenticado:');
    console.log('  {');
    console.log('    "error": "Usuario no autenticado",');
    console.log('    "details": "Debe iniciar sesión para realizar esta operación"');
    console.log('  }');
    console.log('');
    console.log('🚫 403 - Acceso denegado:');
    console.log('  {');
    console.log('    "error": "Acceso denegado",');
    console.log('    "details": "Solo los administradores pueden crear productos",');
    console.log('    "requiredRole": "admin",');
    console.log('    "currentRole": "user"');
    console.log('  }');
    console.log('');
    console.log('🚫 403 - Propiedad del recurso:');
    console.log('  {');
    console.log('    "error": "Acceso denegado",');
    console.log('    "details": "Solo puede acceder a su propio carrito",');
    console.log('    "resourceType": "cart",');
    console.log('    "requestedId": "507f1f77bcf86cd799439011"');
    console.log('  }');
}

// Exportar funciones
module.exports = {
    ejemploAutorizacion,
    ejemploConfiguracionPermisos,
    ejemploRespuestasError
};

// Ejecutar ejemplos si el archivo se ejecuta directamente
if (require.main === module) {
    ejemploAutorizacion()
        .then(() => {
            ejemploConfiguracionPermisos();
            ejemploRespuestasError();
        })
        .catch(console.error);
} 