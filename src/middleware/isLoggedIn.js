const jwt = require("jsonwebtoken");

const AppError = require("../utils/appError");

module.exports = isLoggedIn = catchAsync(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        throw new AppError("Sign in before trying to access this route", 401);
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) {
        throw new AppError("Token verification failed", 401);
    }
    req.user = payload;
    next();
});
