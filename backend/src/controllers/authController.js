// backend/controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Session = require("../models/Session");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const TOKEN_EXPIRY = "7d"; // 7 days login persistence

// User Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const user = new User({
      name,
      email,
      password, // Don't hash here - the User model pre-save hook will handle it
      role: role || "user",
    });
    await user.save();
    res.status(201).json({ message: "Signup successful, please login" });
  } catch (err) {
    res.status(500).json({ error: "Signup failed", details: err.message });
  }
};

// User/Admin Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    // Create session for persistent login
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await Session.create({
      userId: user._id,
      token,
      expiresAt,
      isAdmin: user.role === 'admin' || user.role === 'superadmin',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};

// User/Admin Logout
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers["authorization"];
    if (token) {
      await Session.deleteOne({ token });
    }
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed", details: err.message });
  }
};

// Token Verification Middleware
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers["authorization"];
    if (!token) return res.status(401).json({ error: "Unauthorized, token missing" });
    const decoded = jwt.verify(token, JWT_SECRET);
    // Check session validity
    const session = await Session.findOne({ userId: decoded.id, token });
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: "Session expired. Please login again." });
    }
    req.user = decoded;
    req.session = session;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Check Session Validity
exports.checkSession = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers["authorization"];
    if (!token) return res.status(401).json({ valid: false });
    const decoded = jwt.verify(token, JWT_SECRET);
    const session = await Session.findOne({ userId: decoded.id, token });
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ valid: false, error: "Session expired" });
    }
    res.status(200).json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: "Session expired" });
  }
};
// Get Current User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile", details: err.message });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile", details: err.message });
  }
};