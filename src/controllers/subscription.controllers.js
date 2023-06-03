const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const Subscription = require('../models/subscription.models');

module.exports = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  await Subscription.create({ email });
  res.status(200).json({
    message: 'You were subscribed on our news successfully',
  });
});

module.exports = catchAsync(async (req, res, next) => {
  res.status(200).json({
    message: 'You were unsubscribed from our news successfully',
  });
});
