const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/user.models');

exports.isLoggedIn = catchAsync(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(
            new AppError('Sign in before trying to access this route', 401)
        );
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) {
        return next(new AppError('Token verification failed', 401));
    }

    const user = await User.findById(payload.id).select(
        '+password +passwordChangedAt'
    );

    if (!user) {
        return next(
            new AppError('Sign in before trying to access this route', 401)
        );
    }

    if (new Date(payload.iat * 1000) > user.passwordChangedAt) {
        return next(
            new AppError(
                'User recently changed password! Please log in again.',
                401
            )
        );
    }

    req.user = user;
    next();
});

exports.restrictTo = requiredRole => {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return next(
                new AppError('Sign in before trying to access this route', 401)
            );
        }

        if (user.role !== requiredRole) {
            return next(
                new AppError("You don't have access to this route", 403)
            );
        }

        next();
    };
};
