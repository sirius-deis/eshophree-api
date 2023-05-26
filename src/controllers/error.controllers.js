const log = require('../utils/log');

const { NODE_ENV } = process.env;

// eslint-disable-next-line
module.exports = (error, req, res, next) => {
    if (error.isOperational) {
        if (NODE_ENV === 'development') {
            log('error', 'magenta', 'operational error', error.name, error);
        }
        res.status(error.statusCode).json({ message: error.message });
    } else {
        log('error', 'red', 'server status', error.name, error);
        res.status(500).json({
            message: 'Something went wrong. Please try again later',
        });
    }
};
