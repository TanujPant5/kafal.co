const Product = require('../models/Product');

// Get all products (with optional category filter and search)
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products.', error: error.message });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product.', error: error.message });
  }
};

// Create a new product (admin)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, isOutOfStock } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required.' });
    }

    const images = req.files ? req.files.map((file) => file.path) : [];

    const product = new Product({
      name,
      description: description || '',
      price: Number(price),
      images,
      category,
      stock: Number(stock) || 0,
      isOutOfStock: isOutOfStock === 'true' || isOutOfStock === true,
    });

    await product.save();
    await product.populate('category', 'name slug');
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product.', error: error.message });
  }
};

// Update a product (admin)
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, isOutOfStock, existingImages } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);
    if (isOutOfStock !== undefined) {
      product.isOutOfStock = isOutOfStock === 'true' || isOutOfStock === true;
    }

    // Handle images: keep existing images + add new uploads
    let images = [];
    if (existingImages) {
      images = Array.isArray(existingImages) ? existingImages : [existingImages];
    }
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);
      images = [...images, ...newImages];
    }
    if (images.length > 0 || existingImages !== undefined) {
      product.images = images;
    }

    await product.save();
    await product.populate('category', 'name slug');
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product.', error: error.message });
  }
};

// Delete a product (admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product.', error: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
