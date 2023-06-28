const logger = require('../api/logger');

module.exports = (error, req, res, next) => {
  if (error.code === 11000) {
    error.statusCode = 400;
    error.message = 'Email address is already in use';
    error.isOperational = true;
  }
  logger.error(`${error.name}, ${error}`);
  if (error.isOperational) {
    res.status(error.statusCode).json({ message: error.message });
  } else {
    res.status(500).json({
      message: 'Something went wrong. Please try again later',
    });
  }
};
