function AppError(message, statusCode) {
    Error.call(this, message);
    this.message = message;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
}

Object.setPrototypeOf(AppError, Error);

module.exports = AppError;
