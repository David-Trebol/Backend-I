const express = require('express');
const router = express.Router();
const { authenticateAndGetUser } = require('../middleware/auth.middleware');
const {
    checkPurchasePermission,
    checkPurchaseLimits,
    checkResourceOwnership,
    checkAccountStatus,
    applyRoleDiscount,
    checkCouponPermission,
    logPurchaseActivity,
    getUserPermissions
} = require('../middleware/purchaseAuthorization.middleware');
const { validateRequest, schemas } = require('../utils/validator');
const { log } = require('../utils/logger');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User'); // Added missing import for User

// Middleware para obtener orden por ID
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('items.product');
        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        req.order = order;
        next();
    } catch (error) {
        next(error);
    }
};

// Middleware para obtener carrito por ID
const getCartById = async (req, res, next) => {
    try {
        const cart = await Cart.findById(req.params.cartId).populate('products.product');
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        req.cart = cart;
        next();
    } catch (error) {
        next(error);
    }
};

// ===========================================
// RUTAS DE ÓRDENES
// ===========================================

// GET /orders - Obtener órdenes del usuario
router.get('/orders', 
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('view', 'own_orders'),
    logPurchaseActivity('VIEW_ORDERS'),
    async (req, res) => {
        try {
            const orders = await Order.find({ 'customer.id': req.user.id })
                .populate('items.product')
                .sort({ createdAt: -1 });

            res.json({
                message: 'Órdenes obtenidas exitosamente',
                orders: orders.map(order => order.getPublicInfo()),
                userRole: req.user.role,
                permissions: getUserPermissions(req.user.role)
            });
        } catch (error) {
            next(error);
        }
    }
);

// GET /orders/:orderId - Obtener orden específica
router.get('/orders/:orderId',
    authenticateAndGetUser,
    checkAccountStatus(),
    getOrderById,
    checkResourceOwnership('order'),
    logPurchaseActivity('VIEW_ORDER'),
    async (req, res) => {
        try {
            const orderInfo = req.user.role === 'customer' ? 
                req.order.getPublicInfo() : 
                req.order.getDetailedInfo(req.user);

            res.json({
                message: 'Orden obtenida exitosamente',
                order: orderInfo,
                userRole: req.user.role,
                permissions: getUserPermissions(req.user.role)
            });
        } catch (error) {
            next(error);
        }
    }
);

// POST /orders - Crear nueva orden
router.post('/orders',
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('create', 'orders'),
    checkPurchaseLimits('order_value'),
    checkPurchaseLimits('cart_items'),
    checkCouponPermission(),
    applyRoleDiscount(),
    logPurchaseActivity('CREATE_ORDER'),
    async (req, res) => {
        try {
            const orderData = {
                items: req.body.items,
                paymentMethod: req.body.paymentMethod,
                shippingMethod: req.body.shippingMethod,
                shippingCost: req.body.shippingCost,
                notes: req.body.notes,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            };

            const order = await Order.createOrder(orderData, req.user);

            // Aplicar descuento de rol si existe
            if (req.roleDiscount) {
                order.pricing.discount += (order.pricing.subtotal * req.roleDiscount) / 100;
                order.calculateTotal();
                await order.save();
            }

            log.business('ORDER_CREATED', 'purchase', 'create', {
                orderId: order._id,
                userId: req.user.id,
                userRole: req.user.role,
                total: order.pricing.total,
                items: order.items.length
            });

            res.status(201).json({
                message: 'Orden creada exitosamente',
                order: order.getPublicInfo(),
                roleDiscount: req.roleDiscount || 0,
                userRole: req.user.role
            });
        } catch (error) {
            next(error);
        }
    }
);

// PUT /orders/:orderId/cancel - Cancelar orden
router.put('/orders/:orderId/cancel',
    authenticateAndGetUser,
    checkAccountStatus(),
    getOrderById,
    checkResourceOwnership('order'),
    checkPurchasePermission('update', 'own_orders'),
    logPurchaseActivity('CANCEL_ORDER'),
    async (req, res) => {
        try {
            if (!req.order.canCancel(req.user)) {
                return res.status(403).json({
                    error: 'No puedes cancelar esta orden',
                    details: 'Solo puedes cancelar órdenes pendientes o pagadas'
                });
            }

            await req.order.cancel(req.user, req.body.reason || 'Cancelado por el usuario');

            log.business('ORDER_CANCELLED', 'purchase', 'cancel', {
                orderId: req.order._id,
                userId: req.user.id,
                userRole: req.user.role,
                reason: req.body.reason
            });

            res.json({
                message: 'Orden cancelada exitosamente',
                order: req.order.getPublicInfo(),
                userRole: req.user.role
            });
        } catch (error) {
            next(error);
        }
    }
);

// ===========================================
// RUTAS DE CARRITO
// ===========================================

// GET /cart - Obtener carrito del usuario
router.get('/cart',
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('view', 'own_cart'),
    logPurchaseActivity('VIEW_CART'),
    async (req, res) => {
        try {
            const cart = await Cart.findOne({ user: req.user.id })
                .populate('products.product');

            if (!cart) {
                return res.json({
                    message: 'Carrito vacío',
                    cart: { products: [], total: 0 },
                    userRole: req.user.role
                });
            }

            res.json({
                message: 'Carrito obtenido exitosamente',
                cart: {
                    id: cart._id,
                    products: cart.products,
                    total: cart.total
                },
                userRole: req.user.role,
                limits: req.user.getPurchaseLimits()
            });
        } catch (error) {
            next(error);
        }
    }
);

// POST /cart/items - Agregar item al carrito
router.post('/cart/items',
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('create', 'cart_items'),
    checkPurchaseLimits('item_quantity'),
    logPurchaseActivity('ADD_CART_ITEM'),
    async (req, res) => {
        try {
            const { productId, quantity } = req.body;

            // Verificar que el producto existe
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            // Verificar stock
            if (product.stock < quantity) {
                return res.status(400).json({ 
                    error: 'Stock insuficiente',
                    available: product.stock,
                    requested: quantity
                });
            }

            let cart = await Cart.findOne({ user: req.user.id });
            if (!cart) {
                cart = new Cart({ user: req.user.id, products: [] });
            }

            // Verificar si el producto ya está en el carrito
            const existingItem = cart.products.find(item => 
                item.product.toString() === productId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.products.push({
                    product: productId,
                    quantity: quantity,
                    price: product.price
                });
            }

            await cart.save();
            await cart.populate('products.product');

            log.business('CART_ITEM_ADDED', 'purchase', 'add', {
                userId: req.user.id,
                userRole: req.user.role,
                productId: productId,
                quantity: quantity,
                cartId: cart._id
            });

            res.json({
                message: 'Producto agregado al carrito',
                cart: {
                    id: cart._id,
                    products: cart.products,
                    total: cart.total
                },
                userRole: req.user.role
            });
        } catch (error) {
            next(error);
        }
    }
);

// PUT /cart/items/:itemId - Actualizar cantidad
router.put('/cart/items/:itemId',
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('update', 'own_cart'),
    checkPurchaseLimits('item_quantity'),
    logPurchaseActivity('UPDATE_CART_ITEM'),
    async (req, res) => {
        try {
            const { quantity } = req.body;
            const cart = await Cart.findOne({ user: req.user.id });

            if (!cart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }

            const item = cart.products.id(req.params.itemId);
            if (!item) {
                return res.status(404).json({ error: 'Item no encontrado' });
            }

            // Verificar stock
            const product = await Product.findById(item.product);
            if (product.stock < quantity) {
                return res.status(400).json({ 
                    error: 'Stock insuficiente',
                    available: product.stock,
                    requested: quantity
                });
            }

            item.quantity = quantity;
            await cart.save();
            await cart.populate('products.product');

            res.json({
                message: 'Cantidad actualizada',
                cart: {
                    id: cart._id,
                    products: cart.products,
                    total: cart.total
                },
                userRole: req.user.role
            });
        } catch (error) {
            next(error);
        }
    }
);

// DELETE /cart/items/:itemId - Eliminar item del carrito
router.delete('/cart/items/:itemId',
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('delete', 'own_cart_items'),
    logPurchaseActivity('REMOVE_CART_ITEM'),
    async (req, res) => {
        try {
            const cart = await Cart.findOne({ user: req.user.id });

            if (!cart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }

            cart.products = cart.products.filter(item => 
                item._id.toString() !== req.params.itemId
            );

            await cart.save();
            await cart.populate('products.product');

            res.json({
                message: 'Producto removido del carrito',
                cart: {
                    id: cart._id,
                    products: cart.products,
                    total: cart.total
                },
                userRole: req.user.role
            });
        } catch (error) {
            next(error);
        }
    }
);

// ===========================================
// RUTAS DE WISHLIST
// ===========================================

// GET /wishlist - Obtener wishlist del usuario
router.get('/wishlist',
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('view', 'wishlist'),
    logPurchaseActivity('VIEW_WISHLIST'),
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id).populate('wishlist');
            
            res.json({
                message: 'Wishlist obtenida exitosamente',
                wishlist: user.wishlist,
                userRole: req.user.role
            });
        } catch (error) {
            next(error);
        }
    }
);

// POST /wishlist/items - Agregar item a wishlist
router.post('/wishlist/items',
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('create', 'wishlist_items'),
    logPurchaseActivity('ADD_WISHLIST_ITEM'),
    async (req, res) => {
        try {
            const { productId } = req.body;

            // Verificar que el producto existe
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            const user = await User.findById(req.user.id);
            if (user.wishlist.includes(productId)) {
                return res.status(400).json({ error: 'Producto ya está en tu wishlist' });
            }

            user.wishlist.push(productId);
            await user.save();

            res.json({
                message: 'Producto agregado a wishlist',
                wishlist: user.wishlist,
                userRole: req.user.role
            });
        } catch (error) {
            next(error);
        }
    }
);

// DELETE /wishlist/items/:productId - Eliminar item de wishlist
router.delete('/wishlist/items/:productId',
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('delete', 'own_wishlist_items'),
    logPurchaseActivity('REMOVE_WISHLIST_ITEM'),
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            user.wishlist = user.wishlist.filter(id => 
                id.toString() !== req.params.productId
            );
            await user.save();

            res.json({
                message: 'Producto removido de wishlist',
                wishlist: user.wishlist,
                userRole: req.user.role
            });
        } catch (error) {
            next(error);
        }
    }
);

// ===========================================
// RUTAS DE CUPONES
// ===========================================

// POST /coupons/apply - Aplicar cupón
router.post('/coupons/apply',
    authenticateAndGetUser,
    checkAccountStatus(),
    checkPurchasePermission('special', 'apply_coupons'),
    checkCouponPermission(),
    logPurchaseActivity('APPLY_COUPON'),
    async (req, res) => {
        try {
            const { couponCode, orderId } = req.body;

            // Verificar que el cupón existe y es válido
            const user = await User.findById(req.user.id);
            const coupon = user.coupons.find(c => 
                c.code === couponCode && 
                !c.used &&
                new Date() >= c.validFrom &&
                new Date() <= c.validUntil
            );

            if (!coupon) {
                return res.status(400).json({ error: 'Cupón inválido o expirado' });
            }

            // Aplicar cupón a la orden
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ error: 'Orden no encontrada' });
            }

            // Verificar que la orden pertenece al usuario
            if (order.customer.id.toString() !== req.user.id.toString()) {
                return res.status(403).json({ error: 'No puedes aplicar cupones a órdenes de otros usuarios' });
            }

            // Verificar monto mínimo de compra
            if (order.pricing.subtotal < coupon.minimumPurchase) {
                return res.status(400).json({ 
                    error: 'Monto mínimo no alcanzado',
                    required: coupon.minimumPurchase,
                    current: order.pricing.subtotal
                });
            }

            // Aplicar descuento
            const discountAmount = coupon.type === 'percentage' 
                ? (order.pricing.subtotal * coupon.discount) / 100
                : coupon.discount;

            order.pricing.discount += discountAmount;
            order.coupons.push({
                code: coupon.code,
                discount: discountAmount,
                type: coupon.type,
                appliedAt: new Date()
            });

            order.calculateTotal();
            await order.save();

            // Marcar cupón como usado
            coupon.used = true;
            await user.save();

            res.json({
                message: 'Cupón aplicado exitosamente',
                discount: discountAmount,
                newTotal: order.pricing.total,
                userRole: req.user.role
            });
        } catch (error) {
            next(error);
        }
    }
);

// ===========================================
// RUTAS DE PERMISOS Y LÍMITES
// ===========================================

// GET /permissions - Obtener permisos del usuario
router.get('/permissions',
    authenticateAndGetUser,
    async (req, res) => {
        try {
            const permissions = getUserPermissions(req.user.role);
            const limits = req.user.getPurchaseLimits();
            const roleDiscount = req.user.getRoleDiscount();

            res.json({
                message: 'Permisos obtenidos exitosamente',
                user: {
                    id: req.user.id,
                    role: req.user.role,
                    status: req.user.status,
                    emailVerified: req.user.verification.emailVerified
                },
                permissions: permissions,
                limits: limits,
                roleDiscount: roleDiscount,
                canPurchase: req.user.canPurchase(),
                canApplyCoupons: req.user.canApplyCoupons(),
                canSeeWholesalePrices: req.user.canSeeWholesalePrices(),
                canManageInventory: req.user.canManageInventory(),
                canProcessRefunds: req.user.canProcessRefunds()
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router; 