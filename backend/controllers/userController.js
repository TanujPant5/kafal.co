const User = require('../models/User');
const Order = require('../models/Order');

// Register or login by phone number
const loginOrRegister = async (req, res) => {
  try {
    const { phone, name } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Valid 10-digit phone number is required.' });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      // New user — name required for registration
      if (!name) {
        return res.status(400).json({ message: 'Name is required for new users.', isNew: true });
      }
      user = new User({ name, phone });
      await user.save();
    }

    res.json({ user, message: user ? 'Welcome back!' : 'Account created!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to login/register.', error: error.message });
  }
};

// Get user profile by phone
const getProfile = async (req, res) => {
  try {
    const { phone } = req.params;
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile.', error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { phone } = req.params;
    const { name, email, address } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name;
    if (email !== undefined) user.email = email;
    if (address) {
      if (address.street !== undefined) user.address.street = address.street;
      if (address.city !== undefined) user.address.city = address.city;
      if (address.state !== undefined) user.address.state = address.state;
      if (address.pincode !== undefined) user.address.pincode = address.pincode;
    }

    await user.save();
    res.json({ user, message: 'Profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile.', error: error.message });
  }
};

// Get user's order history
const getOrderHistory = async (req, res) => {
  try {
    const { phone } = req.params;
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const orders = await Order.find({
      'customer.phone': phone,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get order history.', error: error.message });
  }
};

module.exports = { loginOrRegister, getProfile, updateProfile, getOrderHistory };
