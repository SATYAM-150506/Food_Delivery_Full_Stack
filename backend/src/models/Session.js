const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true, // JWT or random session token
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true, // will be set to 7 days later
    },
    userAgent: {
      type: String, // optional: to track device/browser
    },
    ipAddress: {
      type: String, // optional: for extra security
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    helpDeskSession: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Session", sessionSchema);
