const adminMiddleware = (req, res, next) => {
	if (
		req.user &&
		(req.user.role === 'admin' || req.user.role === 'superadmin') &&
		req.session && req.session.isAdmin
	) {
		next();
	} else {
		res.status(403).json({ message: 'Access denied. Admins only.' });
	}
};

module.exports = adminMiddleware;
