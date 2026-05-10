const express = require('express');
const router = express.Router();

const { getCategories } = require('../controllers/categoryController');
const { getProducts, getProductById } = require('../controllers/productController');
const { createOrder, verifyPayment, trackOrder } = require('../controllers/orderController');
const { loginOrRegister, getProfile, updateProfile, getOrderHistory } = require('../controllers/userController');

// Categories
router.get('/categories', getCategories);

// Products
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

// Orders
router.post('/orders/create', createOrder);
router.post('/orders/verify', verifyPayment);
router.get('/orders/track', trackOrder);

// Users
router.post('/users/login', loginOrRegister);
router.get('/users/:phone', getProfile);
router.put('/users/:phone', updateProfile);
router.get('/users/:phone/orders', getOrderHistory);

module.exports = router;
