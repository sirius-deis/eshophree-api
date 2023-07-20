const jwt = require('jsonwebtoken');

const AppError = require('../utils/appError');
const User = require('../models/user.models');
const UserInfo = require('../models/userInfo.models');
const UserPayment = require('../models/userPayment.models');
const Cart = require('../models/cart.models');
const ResetToken = require('../models/resetToken.models');
const ActivateToken = require('../models/activateToken.models');
const Wishlist = require('../models/wishlist.models');
const sendEmail = require('../api/email');
const { addToMapIfValuesExist } = require('../utils/utils');
const { getValue, setValue } = require('../db/redis');
const { createToken } = require('../utils/utils');
const { resizeAndSave, deleteFile } = require('../api/uploadFile');

const catchAsync = require('../utils/catchAsync');
const Image = require('../models/image.models');

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const arePasswordsTheSame = (next, password1, password2) => {
  if (password1 !== password2) {
    next(new AppError('Passwords are not the same. Please provide correct passwords', 400));
  } else {
    return true;
  }
};

const deleteResetTokenIfExist = async (userId) => {
  const token = await ResetToken.findOne({ userId });
  if (token) {
    await token.deleteOne();
  }
};

const sendResponseWithNewToken = (res, statusCode, data, userId) => {
  const token = signToken(userId);
  res.cookie('token', token, {
    expires: new Date(Date.now() + parseInt(process.env.JWT_EXPIRES_IN, 10) * 24 * 60 * 60 * 1000),
  });
  res.status(statusCode).json({ ...data, token });
};

const buildLink = (req, route, token = '') => {
  const link = `${req.protocol}://${req.get('host')}${req.baseUrl}/${route}/${token}`;

  return link;
};

const addTokenToBlocklist = async (id, token, expirationTime) => {
  const value = await getValue(id, token);
  if (value === null) {
    await setValue(`${id}`, token, { EX: expirationTime });
  }
};

exports.signup = catchAsync(async (req, res, next) => {
  // eslint-disable-next-line object-curly-newline
  const { name, surname, email, password, passwordConfirm } = req.body;

  if (!arePasswordsTheSame(next, password, passwordConfirm)) {
    return;
  }

  const user = await User.create({
    name,
    surname,
    email,
    password,
  });
  await Cart.create({ userId: user._id });
  await Wishlist.create({ userId: user._id });
  const activateToken = createToken();
  await ActivateToken.create({ userId: user._id, token: activateToken });

  await sendEmail('Activate token', email, 'verification', {
    title: 'Please activate your account',
    link: buildLink(req, 'activate', activateToken),
    homeLink: buildLink(req, '/'),
    firstName: user.name,
    from: 'Esjophree team',
  });

  res.status(201).json({
    message: 'Account was successfully created. Check your email to activate it.',
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password').populate('pictureId');
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  if (!user.active && user.createdAt !== user.updatedAt) {
    return next(new AppError('You account is deactivated. Please reactivate it', 401));
  }

  user.password = undefined;

  const cart = await Cart.findOne({ userId: user._id });
  const wishlist = await Wishlist.findOne({ userId: user._id });

  sendResponseWithNewToken(
    res,
    200,
    {
      message: 'You was sign in successfully',
      data: { user, cart, wishlist },
    },
    user._id,
  );
});

exports.activate = catchAsync(async (req, res, next) => {
  const { activateToken: token } = req.params;
  const activateToken = await ActivateToken.findOne({ token });

  if (!activateToken) {
    return next(new AppError('Token verification failed', 400));
  }
  const user = await User.findById(activateToken.userId);

  if (!user) {
    return next(new AppError('Token expired or is incorrect', 400));
  }

  user.active = true;

  await user.save();
  await activateToken.deleteOne();

  await sendEmail('Welcome', user.email, 'welcome', {
    title: 'Welcome to Eshophree',
    link: buildLink(req, 'login'),
    homeLink: buildLink(req, '/'),
  });

  res.status(200).json({
    message: 'Your account was activated successfully',
  });
});

exports.deactivate = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { password } = req.body;

  if (!(await user.checkPassword(password, user.password))) {
    return next(new AppError('Incorrect password', 401));
  }

  user.active = false;

  await user.save();

  const token = req.headers.authorization.match(/^Bearer (.*)$/)[1];
  const { userId, exp } = req;
  const expirationTime = (new Date(exp * 1000) - new Date()) / 1000;
  addTokenToBlocklist(userId, token, expirationTime);

  res.status(200).json({
    message: 'Your account was deactivated successfully',
  });
});

exports.reactivate = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user.active) {
    return next(new AppError('Your account is already active.', 400));
  }

  await ActivateToken.findOneAndDelete({ userId: user._id });
  const activateToken = createToken();
  await ActivateToken.create({ userId: user._id, token: activateToken });

  await sendEmail('Activate token', email, 'verification', {
    title: 'Reactivate your account',
    link: buildLink(req, 'activate', activateToken),
    homeLink: buildLink(req, '/'),
  });
  res.status(200).json({
    message: 'We sent token to your email.',
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { password, newPassword, newPasswordConfirm } = req.body;

  if (!(await user.checkPassword(password, user.password))) {
    return next(new AppError('Incorrect password', 401));
  }

  if (!arePasswordsTheSame(next, newPassword, newPasswordConfirm)) {
    return;
  }

  user.password = newPassword;
  await user.save();

  sendResponseWithNewToken(res, 200, { message: 'Password was updated successfully' }, user._id);
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('There is no user with such email', 404));
  }

  await deleteResetTokenIfExist(user._id);
  const token = await createToken();
  await ResetToken.create({ userId: user._id, token });

  await sendEmail('Reset token', user.email, 'reset', {
    title: 'Reset your password',
    link: buildLink(req, 'reset-password', token),
    homeLink: buildLink(req, '/'),
  });
  res.status(200).json({
    message: 'Your reset token was sent on your email',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { newPassword, newPasswordConfirm } = req.body;

  const dbToken = await ResetToken.findOne({ token });

  if (!dbToken) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  if (!arePasswordsTheSame(next, newPassword, newPasswordConfirm)) {
    return;
  }

  const user = await User.findById(dbToken.userId).select('+password');

  if (await user.checkPassword(newPassword, user.password)) {
    return next(new AppError("New password can't be the same as the previous one", 400));
  }
  user.password = newPassword;

  await user.save();
  await dbToken.deleteOne();

  res.status(200).json({ message: 'Password was changed successfully' });
});

exports.logout = (req, res) => {
  const token = req.headers.authorization.match(/^Bearer (.*)$/)[1];
  const { userId, exp } = req;
  const expirationTime = (new Date(exp * 1000) - new Date()) / 1000;
  addTokenToBlocklist(userId, token, expirationTime);
  res.status(204).send();
};

exports.deleteAccount = catchAsync(async (req, res, next) => {
  const user = req.user.populate('pictureId');
  const { password } = req.body;
  if (!(await user.checkPassword(password, user.password))) {
    return next(new AppError('Incorrect password', 401));
  }

  await Cart.deleteOne({ userId: user._id });
  await Wishlist.deleteOne({ userId: user._id });
  await UserInfo.findByIdAndDelete(user._id);
  await UserPayment.findByIdAndDelete(user._id);
  if (user.photo) {
    // deleteUserPhoto(`${dirPath}/${user.photo}`);
  }

  await Promise.all([deleteFile(user.pictureId.publicId), user.deleteOne()]);

  res.status(204).send();
});

exports.me = catchAsync(async (req, res) => {
  const user = req.user.populate('pictureId');
  const cart = await Cart.findOne({ userId: user._id }).populate('products.productId');
  const wishlist = await Wishlist.findOne({ userId: user._id }).populate('products.productId');

  user.password = undefined;

  res.status(200).json({
    message: 'You were sign in successfully',
    data: { user, cart, wishlist },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { name, surname } = req.body;

  if (user.name === name && user.surname === surname) {
    return next(new AppError('Please change at least one field to access this route', 400));
  }

  const map = addToMapIfValuesExist(name, surname);
  await user.updateOne(map);

  res.status(200).json({
    message: 'Your data was updated successfully',
  });
});

exports.updateUserInfo = catchAsync(async (req, res, next) => {
  const { user } = req;
  // eslint-disable-next-line object-curly-newline
  const { addressStreet, city, postalCode, country, telephone, mobile } = req.body;

  const map = addToMapIfValuesExist({
    addressStreet,
    city,
    postalCode,
    country,
    telephone,
    mobile,
  });

  if (!map) {
    return next(new AppError('Please provide information', 400));
  }

  await UserInfo.findOneAndUpdate({ userId: user._id }, { ...map });

  res.status(200).json({
    message: 'You information was successfully updated',
  });
});

exports.updateUserPayment = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { paymentType, provider } = req.body;

  const map = addToMapIfValuesExist(paymentType, provider);

  if (!map) {
    return next(new AppError('Please provide information', 400));
  }

  await UserPayment.findOneAndUpdate({ userId: user._id }, { ...map }, { runValidators: true });

  res.status(200).json({
    message: 'You information was successfully updated',
  });
});

exports.updatePhoto = catchAsync(async (req, res, next) => {
  const user = await req.user.populate('pictureId');

  const { file } = req;

  const { buffer } = file;

  const cldResponse = await resizeAndSave(buffer, { width: 200, height: 200 }, 'jpeg', 'users');

  if (user.pictureId) {
    await Promise.all([
      deleteFile(user.pictureId.publicId),
      Image.findByIdAndUpdate(user.pictureId._id, {
        $set: {
          fileUrl: cldResponse.secure_url,
          publicId: cldResponse.public_id,
        },
      }),
    ]);
  } else {
    const image = await Image.create({
      fileUrl: cldResponse.secure_url,
      publicId: cldResponse.public_id,
    });

    user.pictureId = image._id;
  }

  await user.save();

  res.status(200).json({
    message: 'Photo was updated successfully',
  });
});

exports.deletePhoto = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { pictureId } = req.params;

  const image = await Image.findById(pictureId);
  if (!image) {
    return next(new AppError('There is no picture with provided id', 404));
  }

  const isExistOnUser = user.pictureId.equals(pictureId);

  if (!isExistOnUser) {
    return next(new AppError('There is no picture with provided id for such a user', 404));
  }

  user.pictureId = undefined;

  await Promise.all([deleteFile(image.publicId), image.deleteOne, user.save()]);

  res.status(204).send();
});
