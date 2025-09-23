const errorHandler = (err, req, res, next) => {
	console.error(err.stack);
	let status = err.status || 500;
	let message = err.message || 'Internal Server Error';
	let code = err.code || null;

	// Handle Mongoose validation errors
	if (err.name === 'ValidationError') {
		status = 400;
		message = 'Validation Error';
	}

	// Handle JWT errors
	if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
		status = 401;
		message = 'Authentication Error';
	}

	res.status(status).json({
		success: false,
		message,
		code,
		error: process.env.NODE_ENV === 'production' ? undefined : err
	});
};

module.exports = errorHandler;
