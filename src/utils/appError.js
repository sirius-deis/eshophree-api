function AppError(message, statusCode) {
    Error.call(this, message);
    this.name = this.constructor.name;
    this.message = message;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
}

Object.setPrototypeOf(AppError.prototype, Error.prototype);

module.exports = AppError;
