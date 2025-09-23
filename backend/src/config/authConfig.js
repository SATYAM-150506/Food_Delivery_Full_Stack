// backend/src/config/authConfig.js
module.exports = {
  jwtSecret: process.env.JWT_SECRET || "supersecretkey123", // store safely in .env
  jwtExpire: "7d", // login session valid for 7 days
  saltRounds: 10, // bcrypt password hashing
  adminSessionExpire: "7d", // admin session valid for 7 days
  tokenCookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
};
