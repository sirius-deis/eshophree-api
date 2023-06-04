const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/user.models');
const { getValue } = require('../db/redis');

exports.getUser = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/)[1];
  if (!token) {
    return next();
  }
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  if (!payload) {
    return next();
  }

  const blockedToken = await getValue(payload.id, token);

  if (blockedToken) {
    return next();
  }

  const user = await User.findById(payload.id).select('+password +passwordChangedAt');
  if (!user) {
    return next();
  }

  if (new Date(payload.iat * 1000) < user.passwordChangedAt) {
    return next();
  }

  req.user = user;
  req.userId = user._id;
  req.exp = payload.exp;
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.match(/^Bearer (.*)$/)[1];
  if (!token) {
    return next(new AppError('Sign in before trying to access this route', 401));
  }
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  if (!payload) {
    return next(new AppError('Token verification failed', 401));
  }

  const blockedToken = await getValue(payload.id, token);

  if (blockedToken) {
    return next(new AppError('Token is invalid', 401));
  }

  const user = await User.findById(payload.id).select('+password +passwordChangedAt');
  if (!user) {
    return next(new AppError('Sign in before trying to access this route', 401));
  }

  if (new Date(payload.iat * 1000) < user.passwordChangedAt) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  req.user = user;
  req.userId = user._id;
  req.exp = payload.exp;
  next();
});

// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...requiredRoles) => {
  return (req, res, next) => {
    const { user } = req;
    if (!user) {
      return next(new AppError('Sign in before trying to access this route', 401));
    }

    if (!requiredRoles.includes(user.role)) {
      return next(new AppError("You don't have access to this route", 403));
    }

    next();
  };
};
