const log = require('../utils/log');

const { NODE_ENV } = process.env;

// eslint-disable-next-line
module.exports = (error, req, res, next) => {
    if (error.code === 11000) {
        error.statusCode = 400;
        error.message = 'Email address is already in use';
        error.isOperational = true;
    }
    if (error.isOperational) {
        if (NODE_ENV === 'development') {
            log('error', 'magenta', 'server status', error.name, error);
        }
        res.status(error.statusCode).json({ message: error.message, error });
    } else {
        log('error', 'red', 'server status', error.name, error);
        res.status(500).json({
            message: 'Something went wrong. Please try again later',
        });
    }
};
