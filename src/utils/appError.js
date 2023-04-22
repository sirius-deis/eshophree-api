function AppError(message, statusCode) {
    Error.call(this, message);
    this.message = message;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
}

module.exports = AppError;
