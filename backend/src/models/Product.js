const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
  type: String,
  required: true,
  enum: ["Pizza", "Burger", "Drinks", "Desserts", "Chinese", "Indian", "Snacks"],
    },
    tags: [{
      type: String,
    }],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: "", // URL to product image
    },
    images: [{
      type: String,
    }],
    inStock: {
      type: Boolean,
      default: true,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // only admins can add products
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
