const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

const authMiddleware = async (req, res, next) => {
	// Try to get token from Authorization header or cookies
	let token = null;
	
	// First check Authorization header (Bearer token)
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith('Bearer ')) {
		token = authHeader.split(' ')[1];
	} else if (req.cookies && req.cookies.token) {
		// Fallback to cookie token
		token = req.cookies.token;
	}
	
	if (!token) {
		return res.status(401).json({ message: 'No token provided' });
	}
	
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
		req.user = await User.findById(decoded.id).select('-password');
		if (!req.user) {
			return res.status(401).json({ message: 'User not found' });
		}
		
		// Check session validity and expiration (7 days)
		const session = await Session.findOne({ userId: req.user._id, token });
		if (!session || session.expiresAt < Date.now()) {
			return res.status(401).json({ message: 'Session expired. Please login again.' });
		}
		req.session = session;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' });
	}
};

module.exports = authMiddleware;
