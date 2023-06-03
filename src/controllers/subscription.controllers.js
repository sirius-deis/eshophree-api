const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { createToken } = require('../utils/utils');

const Subscription = require('../models/subscription.models');

module.exports = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const token = createToken();
  await Subscription.create({ email, tokenToUnsubscribe: token });
  res.status(200).json({
    message: 'You were subscribed on our news successfully',
  });
});

module.exports = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const tokenToUnsubscribe = await Subscription.findOne({ tokenToUnsubscribe: token });
  if (!tokenToUnsubscribe) {
    return next(new AppError('There is no such email', 404));
  }
  res.status(200).json({
    message: 'You were unsubscribed from our news successfully',
  });
});
