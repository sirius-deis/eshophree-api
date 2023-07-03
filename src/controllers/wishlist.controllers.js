const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Wishlist = require('../models/wishlist');

exports.addToWishlist = catchAsync(async (req, res, next) => {
  return res.status(200).json({ message: 'Product was added to your wishlist successfully' });
});
