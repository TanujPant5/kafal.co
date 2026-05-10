const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const { login } = require('../controllers/adminController');
const { createCategory, deleteCategory } = require('../controllers/categoryController');
const { createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { getOrders, updateOrderStatus } = require('../controllers/orderController');

// Login (no auth required)
router.post('/login', login);

// Protected routes — all below require JWT
router.use(auth);

// Orders
router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// Products
router.post('/products', upload.array('images', 5), createProduct);
router.put('/products/:id', upload.array('images', 5), updateProduct);
router.delete('/products/:id', deleteProduct);

// Categories
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
