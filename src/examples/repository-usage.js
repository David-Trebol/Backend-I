const ProductManager = require('../managers/ProductManager');
const CartManager = require('../managers/CartManager');
const UserManager = require('../managers/UserManager');

// Ejemplo de uso del patrón Repository
async function ejemploUsoRepository() {
    const productManager = new ProductManager();
    const cartManager = new CartManager();
    const userManager = new UserManager();

    try {
        console.log('=== Ejemplo de uso del Patrón Repository ===\n');

        // 1. Crear productos usando el repositorio
        console.log('1. Creando productos...');
        const producto1 = await productManager.addProduct({
            title: 'Laptop Gaming',
            description: 'Laptop para gaming de alto rendimiento',
            code: 'LAP001',
            price: 1500,
            stock: 10,
            category: 'Electrónicos',
            thumbnails: ['laptop1.jpg', 'laptop2.jpg']
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

        // 2. Buscar productos usando métodos específicos del repositorio
        console.log('\n2. Buscando productos por categoría...');
        const productosElectronicos = await productManager.getProductsByCategory('Electrónicos');
        console.log('Productos electrónicos:', productosElectronicos.length);

        console.log('\n3. Buscando productos por rango de precio...');
        const productosBaratos = await productManager.getProductsByPriceRange(0, 100);
        console.log('Productos bajo $100:', productosBaratos.length);

        console.log('\n4. Buscando productos en stock...');
        const productosEnStock = await productManager.getProductsInStock();
        console.log('Productos en stock:', productosEnStock.length);

        // 3. Crear usuario con carrito usando el repositorio
        console.log('\n5. Creando usuario con carrito...');
        const usuario = await userManager.addUser({
            first_name: 'Juan',
            last_name: 'Pérez',
            email: 'juan@example.com',
            age: 25,
            password: 'password123'
        });
        console.log('Usuario creado:', usuario.first_name, usuario.last_name);

        // 4. Obtener usuario con carrito populado
        console.log('\n6. Obteniendo usuario con carrito...');
        const usuarioConCarrito = await userManager.getUserByIdWithCart(usuario._id);
        console.log('Usuario con carrito:', usuarioConCarrito.cart ? 'Sí' : 'No');

        // 5. Agregar productos al carrito usando el repositorio
        console.log('\n7. Agregando productos al carrito...');
        const carritoActualizado = await cartManager.addProductToCart(
            usuarioConCarrito.cart._id,
            producto1._id,
            2
        );
        console.log('Productos en carrito:', carritoActualizado.products.length);

        // 6. Obtener total del carrito
        console.log('\n8. Calculando total del carrito...');
        const totalCarrito = await cartManager.getCartTotal(usuarioConCarrito.cart._id);
        console.log('Total del carrito: $', totalCarrito);

        // 7. Obtener cantidad de items en carrito
        console.log('\n9. Contando items en carrito...');
        const cantidadItems = await cartManager.getCartItemCount(usuarioConCarrito.cart._id);
        console.log('Cantidad de items:', cantidadItems);

        // 8. Actualizar stock de producto
        console.log('\n10. Actualizando stock de producto...');
        const productoActualizado = await productManager.updateProductStock(producto1._id, 2);
        console.log('Stock actualizado:', productoActualizado.stock);

        // 9. Buscar usuarios por rol
        console.log('\n11. Buscando administradores...');
        const admins = await userManager.getAdmins();
        console.log('Cantidad de administradores:', admins.length);

        // 10. Obtener estadísticas
        console.log('\n12. Obteniendo estadísticas...');
        const totalProductos = await productManager.getProductsCount();
        const totalUsuarios = await userManager.getUsersCount();
        console.log('Total productos:', totalProductos);
        console.log('Total usuarios:', totalUsuarios);

        console.log('\n=== Ejemplo completado exitosamente ===');

    } catch (error) {
        console.error('Error en el ejemplo:', error.message);
    }
}

// Ejemplo de transacciones complejas usando repositorios
async function ejemploTransaccionCompleja() {
    const productManager = new ProductManager();
    const cartManager = new CartManager();
    const userManager = new UserManager();

    try {
        console.log('\n=== Ejemplo de Transacción Compleja ===\n');

        // Simular proceso de compra
        console.log('1. Creando productos de ejemplo...');
        const producto = await productManager.addProduct({
            title: 'Auriculares Bluetooth',
            description: 'Auriculares inalámbricos de alta calidad',
            code: 'AUR001',
            price: 80,
            stock: 15,
            category: 'Audio',
            thumbnails: ['auriculares1.jpg']
        });

        console.log('2. Creando usuario...');
        const usuario = await userManager.addUser({
            first_name: 'María',
            last_name: 'García',
            email: 'maria@example.com',
            age: 30,
            password: 'password456'
        });

        console.log('3. Agregando productos al carrito...');
        await cartManager.addProductToCart(usuario.cart, producto._id, 3);

        console.log('4. Calculando total...');
        const total = await cartManager.getCartTotal(usuario.cart);
        console.log('Total de la compra: $', total);

        console.log('5. Actualizando stock...');
        await productManager.updateProductStock(producto._id, 3);
        
        const stockFinal = await productManager.getProductById(producto._id);
        console.log('Stock final del producto:', stockFinal.stock);

        console.log('6. Vaciamos el carrito...');
        await cartManager.clearCart(usuario.cart);
        
        const carritoFinal = await cartManager.getCartById(usuario.cart);
        console.log('Productos en carrito después de vaciar:', carritoFinal.products.length);

        console.log('\n=== Transacción completada exitosamente ===');

    } catch (error) {
        console.error('Error en la transacción:', error.message);
    }
}

// Exportar funciones para uso en otros archivos
module.exports = {
    ejemploUsoRepository,
    ejemploTransaccionCompleja
};

// Ejecutar ejemplos si el archivo se ejecuta directamente
if (require.main === module) {
    ejemploUsoRepository()
        .then(() => ejemploTransaccionCompleja())
        .catch(console.error);
} 