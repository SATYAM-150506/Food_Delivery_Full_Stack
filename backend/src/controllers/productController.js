// backend/controllers/productController.js

const Product = require("../models/Product");

// Create new product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
};

// Get all products (with optional category, tags, featured filtering)
exports.getAllProducts = async (req, res) => {
  try {
    const { category, tags, featured, search } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (featured) filter.isFeatured = featured === 'true';
    if (search) filter.name = { $regex: search, $options: 'i' };
    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};

// ✅ Get single product details
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product", details: err.message });
  }
};

// ✅ Update product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, imageUrl },
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });

    res.status(200).json({ message: "Product updated", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product", details: err.message });
  }
};

// ✅ Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: "Product not found" });

    res.status(200).json({ message: "Product deleted", product: deletedProduct });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product", details: err.message });
  }
};
