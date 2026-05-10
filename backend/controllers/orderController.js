const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const User = require('../models/User');
const generateOrderId = require('../utils/generateOrderId');

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Create a Razorpay order
const createOrder = async (req, res) => {
  try {
    const { items, customer, totalAmount } = req.body;

    if (!items || !items.length || !customer || !totalAmount) {
      return res.status(400).json({ message: 'Items, customer details, and total amount are required.' });
    }

    const razorpay = getRazorpayInstance();

    // Amount in paise (INR smallest unit)
    const options = {
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: generateOrderId(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order.', error: error.message });
  }
};

// Verify Razorpay payment and save order
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      customer,
      totalAmount,
    } = req.body;

    // Verify the payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // Generate unique order ID, retry if collision
    let orderId;
    let exists = true;
    while (exists) {
      orderId = generateOrderId();
      exists = await Order.findOne({ orderId });
    }

    // Save the order
    const order = new Order({
      orderId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      customer,
      items,
      totalAmount,
      status: 'paid',
    });

    await order.save();

    // Link to user if they exist
    if (customer && customer.phone) {
      let user = await User.findOne({ phone: customer.phone });
      if (!user) {
        // Auto-create basic user profile from order info
        user = new User({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: {
            street: customer.address,
            city: customer.city,
            state: customer.state,
            pincode: customer.pincode
          }
        });
      }
      user.orders.push(order._id);
      await user.save();
    }

    res.status(201).json({
      message: 'Payment verified and order placed successfully.',
      orderId: order.orderId,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment verification failed.', error: error.message });
  }
};

// Get all orders (admin) with optional filters
const getOrders = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
  }
};

// Update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status.', error: error.message });
  }
};

// Track order by orderId or email (public)
const trackOrder = async (req, res) => {
  try {
    const { orderId, email } = req.query;

    if (!orderId && !email) {
      return res.status(400).json({ message: 'Order ID or email is required.' });
    }

    let orders;
    if (orderId) {
      orders = await Order.find({ orderId: orderId.toUpperCase() });
    } else {
      orders = await Order.find({ 'customer.email': email.toLowerCase() }).sort({ createdAt: -1 });
    }

    if (!orders.length) {
      return res.status(404).json({ message: 'No orders found.' });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to track order.', error: error.message });
  }
};

module.exports = { createOrder, verifyPayment, getOrders, updateOrderStatus, trackOrder };
