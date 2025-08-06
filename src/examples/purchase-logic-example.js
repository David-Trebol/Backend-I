const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { getUserPermissions, canPerformAction } = require('../middleware/purchaseAuthorization.middleware');
const { log } = require('../utils/logger');

// Ejemplo de lógica de compra mejorada
async function ejemploLogicaCompra() {
    try {
        console.log('=== Ejemplo de Lógica de Compra Mejorada ===\n');

        // 1. Crear usuarios con diferentes roles
        console.log('1. Creando usuarios con diferentes roles...');
        
        const customer = await User.create({
            first_name: 'Juan',
            last_name: 'Cliente',
            email: 'juan@example.com',
            age: 25,
            password: 'password123',
            role: 'customer',
            status: 'active',
            verification: { emailVerified: true }
        });

        const premium = await User.create({
            first_name: 'María',
            last_name: 'Premium',
            email: 'maria@example.com',
            age: 30,
            password: 'password123',
            role: 'premium',
            status: 'active',
            verification: { emailVerified: true }
        });

        const vip = await User.create({
            first_name: 'Carlos',
            last_name: 'VIP',
            email: 'carlos@example.com',
            age: 35,
            password: 'password123',
            role: 'vip',
            status: 'active',
            verification: { emailVerified: true }
        });

        const seller = await User.create({
            first_name: 'Ana',
            last_name: 'Vendedora',
            email: 'ana@example.com',
            age: 28,
            password: 'password123',
            role: 'seller',
            status: 'active',
            verification: { emailVerified: true }
        });

        const manager = await User.create({
            first_name: 'Pedro',
            last_name: 'Gerente',
            email: 'pedro@example.com',
            age: 40,
            password: 'password123',
            role: 'manager',
            status: 'active',
            verification: { emailVerified: true }
        });

        console.log('✅ Usuarios creados con diferentes roles');

        // 2. Crear productos
        console.log('\n2. Creando productos...');
        
        const product1 = await Product.create({
            title: 'Laptop Gaming',
            description: 'Laptop para gaming de alto rendimiento',
            code: 'LAP001',
            price: 1500,
            stock: 10,
            category: 'Electrónicos'
        });

        const product2 = await Product.create({
            title: 'Mouse Inalámbrico',
            description: 'Mouse gaming inalámbrico',
            code: 'MOU001',
            price: 50,
            stock: 25,
            category: 'Accesorios'
        });

        console.log('✅ Productos creados');

        // 3. Simular permisos por rol
        console.log('\n3. Permisos por rol:');
        
        const roles = ['customer', 'premium', 'vip', 'seller', 'manager'];
        
        roles.forEach(role => {
            const permissions = getUserPermissions(role);
            console.log(`\n👤 Rol: ${role.toUpperCase()}`);
            console.log(`  📋 Ver: ${permissions.view.join(', ')}`);
            console.log(`  ➕ Crear: ${permissions.create.join(', ')}`);
            console.log(`  ✏️  Actualizar: ${permissions.update.join(', ')}`);
            console.log(`  🗑️  Eliminar: ${permissions.delete.join(', ')}`);
            console.log(`  ⭐ Especial: ${permissions.special.join(', ')}`);
            console.log(`  💰 Límite de orden: $${permissions.limits.maxOrderValue.toLocaleString()}`);
            console.log(`  📦 Máximo items: ${permissions.limits.maxItems}`);
            console.log(`  🎫 Puede aplicar cupones: ${permissions.limits.canApplyCoupons ? 'SÍ' : 'NO'}`);
            console.log(`  🏪 Puede ver precios mayorista: ${permissions.limits.canSeeWholesalePrices ? 'SÍ' : 'NO'}`);
            console.log(`  📦 Puede gestionar inventario: ${permissions.limits.canManageInventory ? 'SÍ' : 'NO'}`);
            console.log(`  💸 Puede procesar reembolsos: ${permissions.limits.canProcessRefunds ? 'SÍ' : 'NO'}`);
        });

        // 4. Simular acciones específicas
        console.log('\n4. Verificando acciones específicas:');
        
        const actions = [
            { action: 'view', resource: 'own_orders', description: 'Ver propias órdenes' },
            { action: 'view', resource: 'all_orders', description: 'Ver todas las órdenes' },
            { action: 'create', resource: 'orders', description: 'Crear órdenes' },
            { action: 'special', resource: 'apply_coupons', description: 'Aplicar cupones' },
            { action: 'special', resource: 'wholesale_pricing', description: 'Ver precios mayorista' },
            { action: 'special', resource: 'refund_processing', description: 'Procesar reembolsos' }
        ];

        roles.forEach(role => {
            console.log(`\n👤 ${role.toUpperCase()}:`);
            actions.forEach(({ action, resource, description }) => {
                const canDo = canPerformAction(role, action, resource);
                const icon = canDo ? '✅' : '❌';
                console.log(`  ${icon} ${description}: ${canDo ? 'PERMITIDO' : 'DENEGADO'}`);
            });
        });

        // 5. Simular compras con diferentes roles
        console.log('\n5. Simulando compras con diferentes roles:');
        
        const purchaseScenarios = [
            {
                user: customer,
                description: 'Cliente regular - Compra básica',
                items: [{ product: product1._id, quantity: 1, price: 1500 }],
                total: 1500,
                canApplyCoupon: false
            },
            {
                user: premium,
                description: 'Cliente premium - Compra con cupón',
                items: [{ product: product1._id, quantity: 1, price: 1500 }],
                total: 1500,
                canApplyCoupon: true,
                couponDiscount: 5
            },
            {
                user: vip,
                description: 'Cliente VIP - Compra grande',
                items: [
                    { product: product1._id, quantity: 2, price: 1500 },
                    { product: product2._id, quantity: 5, price: 50 }
                ],
                total: 3250,
                canApplyCoupon: true,
                couponDiscount: 10
            },
            {
                user: seller,
                description: 'Vendedor - Compra con precios mayorista',
                items: [{ product: product1._id, quantity: 10, price: 1200 }],
                total: 12000,
                canApplyCoupon: true,
                canSeeWholesale: true
            }
        ];

        for (const scenario of purchaseScenarios) {
            console.log(`\n🛒 ${scenario.description}`);
            console.log(`   👤 Usuario: ${scenario.user.first_name} (${scenario.user.role})`);
            console.log(`   💰 Total: $${scenario.total.toLocaleString()}`);
            console.log(`   🎫 Cupón aplicable: ${scenario.canApplyCoupon ? 'SÍ' : 'NO'}`);
            if (scenario.couponDiscount) {
                console.log(`   💸 Descuento de cupón: ${scenario.couponDiscount}%`);
            }
            if (scenario.canSeeWholesale) {
                console.log(`   🏪 Precios mayorista: HABILITADO`);
            }
            
            // Verificar límites
            const limits = scenario.user.getPurchaseLimits();
            const roleDiscount = scenario.user.getRoleDiscount();
            
            console.log(`   📊 Límite de orden: $${limits.maxOrderValue.toLocaleString()}`);
            console.log(`   📦 Máximo items: ${limits.maxItems}`);
            console.log(`   🎁 Descuento de rol: ${roleDiscount}%`);
            
            // Verificar si la compra es válida
            const isValidOrder = scenario.total <= limits.maxOrderValue;
            const totalWithDiscount = scenario.total * (1 - roleDiscount / 100);
            
            console.log(`   ✅ Orden válida: ${isValidOrder ? 'SÍ' : 'NO'}`);
            console.log(`   💰 Total con descuento: $${totalWithDiscount.toLocaleString()}`);
        }

        // 6. Simular autorizaciones específicas
        console.log('\n6. Autorizaciones específicas por rol:');
        
        const authorizationScenarios = [
            {
                role: 'customer',
                actions: [
                    { action: 'Ver propias órdenes', allowed: true },
                    { action: 'Ver todas las órdenes', allowed: false },
                    { action: 'Aplicar cupones', allowed: false },
                    { action: 'Ver precios mayorista', allowed: false },
                    { action: 'Procesar reembolsos', allowed: false }
                ]
            },
            {
                role: 'premium',
                actions: [
                    { action: 'Ver propias órdenes', allowed: true },
                    { action: 'Ver todas las órdenes', allowed: false },
                    { action: 'Aplicar cupones', allowed: true },
                    { action: 'Ver precios mayorista', allowed: false },
                    { action: 'Procesar reembolsos', allowed: false }
                ]
            },
            {
                role: 'vip',
                actions: [
                    { action: 'Ver propias órdenes', allowed: true },
                    { action: 'Ver todas las órdenes', allowed: false },
                    { action: 'Aplicar cupones', allowed: true },
                    { action: 'Ver precios mayorista', allowed: false },
                    { action: 'Procesar reembolsos', allowed: false }
                ]
            },
            {
                role: 'seller',
                actions: [
                    { action: 'Ver propias órdenes', allowed: true },
                    { action: 'Ver todas las órdenes', allowed: false },
                    { action: 'Aplicar cupones', allowed: true },
                    { action: 'Ver precios mayorista', allowed: true },
                    { action: 'Procesar reembolsos', allowed: false }
                ]
            },
            {
                role: 'manager',
                actions: [
                    { action: 'Ver propias órdenes', allowed: true },
                    { action: 'Ver todas las órdenes', allowed: true },
                    { action: 'Aplicar cupones', allowed: true },
                    { action: 'Ver precios mayorista', allowed: true },
                    { action: 'Procesar reembolsos', allowed: true }
                ]
            }
        ];

        authorizationScenarios.forEach(scenario => {
            console.log(`\n👤 ${scenario.role.toUpperCase()}:`);
            scenario.actions.forEach(({ action, allowed }) => {
                const icon = allowed ? '✅' : '❌';
                console.log(`  ${icon} ${action}: ${allowed ? 'PERMITIDO' : 'DENEGADO'}`);
            });
        });

        // 7. Simular logging de actividades
        console.log('\n7. Logging de actividades de compra:');
        
        const activities = [
            {
                activity: 'VIEW_ORDERS',
                user: customer,
                description: 'Cliente ve sus órdenes'
            },
            {
                activity: 'CREATE_ORDER',
                user: premium,
                description: 'Cliente premium crea orden'
            },
            {
                activity: 'APPLY_COUPON',
                user: vip,
                description: 'Cliente VIP aplica cupón'
            },
            {
                activity: 'VIEW_WHOLESALE_PRICES',
                user: seller,
                description: 'Vendedor ve precios mayorista'
            },
            {
                activity: 'PROCESS_REFUND',
                user: manager,
                description: 'Gerente procesa reembolso'
            }
        ];

        activities.forEach(({ activity, user, description }) => {
            log.business(activity, 'purchase', 'activity', {
                userId: user.id,
                userRole: user.role,
                description: description,
                timestamp: new Date().toISOString()
            });
            console.log(`📝 ${description} - ${user.role.toUpperCase()}`);
        });

        // 8. Simular actualización de historial de compras
        console.log('\n8. Actualización de historial de compras:');
        
        const purchaseHistoryUpdates = [
            { user: customer, orderTotal: 1500 },
            { user: premium, orderTotal: 3000 },
            { user: vip, orderTotal: 5000 },
            { user: seller, orderTotal: 15000 }
        ];

        for (const update of purchaseHistoryUpdates) {
            await update.user.updatePurchaseHistory(update.orderTotal);
            console.log(`📊 ${update.user.first_name} (${update.user.role}):`);
            console.log(`   💰 Total gastado: $${update.user.purchaseHistory.totalSpent.toLocaleString()}`);
            console.log(`   📦 Compras totales: ${update.user.purchaseHistory.totalPurchases}`);
            console.log(`   📈 Promedio por orden: $${update.user.purchaseHistory.averageOrderValue.toLocaleString()}`);
            console.log(`   🎭 Rol actual: ${update.user.role}`);
        }

        console.log('\n=== Ejemplo completado exitosamente ===');

    } catch (error) {
        console.error('❌ Error en el ejemplo:', error.message);
        log.error('Error en ejemplo de lógica de compra', {
            error: error.message,
            stack: error.stack
        });
    }
}

// Ejemplo de configuración de roles
function ejemploConfiguracionRoles() {
    console.log('\n=== Configuración de Roles de Ecommerce ===\n');

    console.log('👥 ROLES DISPONIBLES:');
    console.log('');
    console.log('1. 🛒 CUSTOMER (Cliente regular)');
    console.log('   - Compras básicas');
    console.log('   - Límite: $50,000 por orden');
    console.log('   - Sin cupones');
    console.log('   - Sin precios mayorista');
    console.log('');
    console.log('2. ⭐ PREMIUM (Cliente premium)');
    console.log('   - Compras con cupones');
    console.log('   - Límite: $100,000 por orden');
    console.log('   - Descuento: 5%');
    console.log('   - Wishlist habilitada');
    console.log('');
    console.log('3. 👑 VIP (Cliente VIP)');
    console.log('   - Compras exclusivas');
    console.log('   - Límite: $500,000 por orden');
    console.log('   - Descuento: 10%');
    console.log('   - Soporte prioritario');
    console.log('');
    console.log('4. 🏪 SELLER (Vendedor)');
    console.log('   - Precios mayorista');
    console.log('   - Gestión de inventario');
    console.log('   - Límite: $1,000,000 por orden');
    console.log('   - Descuento: 15%');
    console.log('');
    console.log('5. 👨‍💼 MANAGER (Gerente)');
    console.log('   - Gestión completa');
    console.log('   - Procesamiento de reembolsos');
    console.log('   - Límite: $2,000,000 por orden');
    console.log('   - Descuento: 20%');
    console.log('');
    console.log('6. 🔧 ADMIN (Administrador)');
    console.log('   - Acceso total al sistema');
    console.log('   - Sin límites');
    console.log('   - Descuento: 25%');
    console.log('');
    console.log('7. 🆘 SUPPORT (Soporte)');
    console.log('   - Atención al cliente');
    console.log('   - Procesamiento de reembolsos');
    console.log('   - Límite: $100,000 por orden');
    console.log('');
    console.log('8. 💰 FINANCE (Finanzas)');
    console.log('   - Reportes financieros');
    console.log('   - Gestión de reembolsos');
    console.log('   - Precios mayorista');
    console.log('');
    console.log('9. 📦 LOGISTICS (Logística)');
    console.log('   - Gestión de envíos');
    console.log('   - Gestión de inventario');
    console.log('   - Reportes de entrega');
}

// Ejemplo de permisos específicos
function ejemploPermisosEspecificos() {
    console.log('\n=== Permisos Específicos por Acción ===\n');

    console.log('🔐 PERMISOS DE VISUALIZACIÓN:');
    console.log('   • own_orders: Ver propias órdenes');
    console.log('   • all_orders: Ver todas las órdenes');
    console.log('   • own_cart: Ver propio carrito');
    console.log('   • products: Ver productos');
    console.log('   • categories: Ver categorías');
    console.log('   • wishlist: Ver wishlist');
    console.log('   • exclusive_products: Ver productos exclusivos');
    console.log('   • wholesale_prices: Ver precios mayorista');
    console.log('   • inventory: Ver inventario');
    console.log('   • reports: Ver reportes');
    console.log('');
    console.log('➕ PERMISOS DE CREACIÓN:');
    console.log('   • orders: Crear órdenes');
    console.log('   • cart_items: Agregar items al carrito');
    console.log('   • wishlist_items: Agregar items a wishlist');
    console.log('   • special_orders: Crear órdenes especiales');
    console.log('   • products: Crear productos');
    console.log('   • inventory_updates: Actualizar inventario');
    console.log('   • promotions: Crear promociones');
    console.log('   • refunds: Crear reembolsos');
    console.log('');
    console.log('⭐ PERMISOS ESPECIALES:');
    console.log('   • apply_coupons: Aplicar cupones');
    console.log('   • priority_support: Soporte prioritario');
    console.log('   • exclusive_access: Acceso exclusivo');
    console.log('   • wholesale_pricing: Precios mayorista');
    console.log('   • inventory_management: Gestión de inventario');
    console.log('   • order_management: Gestión de órdenes');
    console.log('   • refund_processing: Procesamiento de reembolsos');
    console.log('   • system_management: Gestión del sistema');
}

// Exportar funciones
module.exports = {
    ejemploLogicaCompra,
    ejemploConfiguracionRoles,
    ejemploPermisosEspecificos
};

// Ejecutar ejemplos si el archivo se ejecuta directamente
if (require.main === module) {
    ejemploLogicaCompra()
        .then(() => {
            ejemploConfiguracionRoles();
            ejemploPermisosEspecificos();
        })
        .catch(console.error);
} 