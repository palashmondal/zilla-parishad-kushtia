const isProduction = process.env.NODE_ENV === 'production';

function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: isProduction ? 'An internal error occurred' : err.message
    });
}

module.exports = errorHandler;
