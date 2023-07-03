const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Wishlist = require('../models/wishlist.models');

exports.getWishlist = catchAsync(async (req, res, next) => {
  const { user } = req;

  const wishlist = await Wishlist.findOne({
    userId: user._id,
  });

  if (!wishlist) {
    return next(new AppError('There is no wishlist for selected user', 404));
  }

  return res.status(200).json({
    message: 'Wishlist was successfully found',
    data: {
      wishlist,
    },
  });
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const { user, product } = req;
  let wishlist = await Wishlist.findOne({
    userId: user._id,
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ userId: user._id });
  }

  const productInWishlist = wishlist.products.find((prod) => prod.productId.equals(product._id));

  if (productInWishlist) {
    return next(new AppError('This product is already in wishlist', 400));
  }

  wishlist.products.push({ productId: product._id });

  await wishlist.save();

  return res.status(200).json({ message: 'Product was added to your wishlist successfully' });
});

exports.deleteFromWishlist = catchAsync(async (req, res, next) => {
  const { user, product } = req;

  const wishlist = await Wishlist.findOne({
    userId: user._id,
  });

  if (!wishlist) {
    return next(new AppError('There is no wishlist for selected user', 404));
  }

  wishlist.products = wishlist.products.filter((prod) => !prod.productId.equals(product._id));

  await wishlist.save();

  return res.status(200).json({ message: 'Product was deleted from your wishlist successfully' });
});

exports.clearWishlist = catchAsync(async (req, res, next) => {
  const { user } = req;

  const wishlist = await Wishlist.findOne({
    userId: user._id,
  });

  if (!wishlist) {
    return next(new AppError('There is no wishlist for selected user', 404));
  }

  wishlist.products = [];

  await wishlist.save();

  return res.status(204).send();
});
