const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { createToken } = require('../utils/utils');
const sendEmail = require('../api/email');

const Subscription = require('../models/subscription.models');

exports.subscribe = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const token = createToken();
  await Subscription.create({ email, tokenToUnsubscribe: token });
  res.status(200).json({
    message: 'You were subscribed on our news successfully',
  });
});

exports.unsubscribe = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const subscriber = await Subscription.findOne({ tokenToUnsubscribe: token });
  if (!subscriber) {
    return next(new AppError('There is no such email', 404));
  }
  await subscriber.deleteOne();

  res.status(204).send();
});

exports.send = catchAsync(async (req, res, next) => {
  const { subject, template } = req.body;
  const subscribers = await Subscription.find();

  // eslint-disable-next-line max-len
  await Promise.all(subscribers.map((subscriber) => sendEmail({ subject, to: subscriber, template, context: {} })));

  res.status(200).json({
    message: 'Email was sent to all subscribers',
  });
});
