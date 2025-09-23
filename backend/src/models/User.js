const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
    },
    addresses: [{
      fullName: { type: String },
      phone: { type: String },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String },
      isDefault: { type: Boolean, default: false },
    }],
    preferences: {
      dietaryRestrictions: [{ type: String }], // vegetarian, vegan, gluten-free, etc.
      favoriteItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }],
      defaultAddress: { type: Number, default: 0 }, // Index of default address
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
    },
    orderHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    }],
    helpDeskRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    }],
    role: {
      type: String,
      enum: ["user", "admin", "deliveryPartner"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Compare passwords for login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
