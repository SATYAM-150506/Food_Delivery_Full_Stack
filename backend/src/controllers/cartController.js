// backend/controllers/cartController.js

const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ✅ Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // create new cart
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity, price: product.price }],
      });
    } else {
      // check if product already in cart
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // update quantity and price
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].price = product.price;
      } else {
        cart.items.push({ product: productId, quantity, price: product.price });
      }
    }
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();
    await cart.populate("items.product");
    
    res.status(200).json({ 
      message: "Item added to cart", 
      items: cart.items,
      totalAmount: cart.totalAmount,
      cart: cart 
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add item", details: err.message });
  }
};

// ✅ Get user cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      // Create empty cart if none exists
      cart = new Cart({
        user: userId,
        items: [],
        totalAmount: 0
      });
      await cart.save();
      return res.status(200).json({ 
        items: [], 
        totalAmount: 0,
        cart: cart 
      });
    }

    // Calculate total and ensure data consistency
    const total = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    cart.totalAmount = total;
    await cart.save();
    
    res.status(200).json({ 
      items: cart.items,
      totalAmount: total,
      cart: cart 
    });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: "Failed to fetch cart", details: err.message });
  }
};

// ✅ Update entire cart (for bulk operations like merging)
exports.updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Items must be an array" });
    }

    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({ user: userId, items: [], totalAmount: 0 });
    }

    // Validate and process items
    const validItems = [];
    for (const item of items) {
      const productId = item.product?._id || item._id;
      const product = await Product.findById(productId);
      
      if (product) {
        validItems.push({
          product: productId,
          quantity: item.quantity,
          price: product.price
        });
      }
    }

    cart.items = validItems;
    cart.totalAmount = validItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    await cart.save();
    await cart.populate("items.product");
    
    res.status(200).json({ 
      message: "Cart updated successfully", 
      items: cart.items,
      totalAmount: cart.totalAmount,
      cart: cart 
    });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: "Failed to update cart", details: err.message });
  }
};

// ✅ Update item quantity
exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1); // remove item
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
    } else {
      return res.status(404).json({ error: "Product not in cart" });
    }

  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  await cart.save();
  res.status(200).json({ message: "Cart updated", cart });
  } catch (err) {
    res.status(500).json({ error: "Failed to update cart", details: err.message });
  }
};

// ✅ Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  await cart.save();
  res.status(200).json({ message: "Item removed", cart });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item", details: err.message });
  }
};

// ✅ Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();
  res.status(200).json({ message: "Cart cleared", cart });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear cart", details: err.message });
  }
};
