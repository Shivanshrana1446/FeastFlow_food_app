const express = require('express');
const { getHealth } = require('../controllers/health.controller');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const restaurantRoutes = require('./restaurant.routes');
const categoryRoutes = require('./category.routes');
const menuRoutes = require('./menu.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const reviewRoutes = require('./review.routes');
const deliveryRoutes = require('./delivery.routes');
const adminRoutes = require('./admin.routes');
const notificationRoutes = require('./notification.routes');

const router = express.Router();

router.get('/health', getHealth);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/categories', categoryRoutes);
router.use('/menu-items', menuRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
