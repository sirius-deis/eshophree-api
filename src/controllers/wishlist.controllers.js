const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Wishlist = require('../models/wishlist.models');
const Product = require('../models/product.models');

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('There is no product with such id', 404));
  }
  let wishlist = await Wishlist.findOne({
    userId: user._id,
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ userId: user._id });
  }

  const productInWishlist = wishlist.products.find((prod) => prod.productId.equals(productId));

  if (productInWishlist) {
    return next(new AppError('This product is already in wishlist', 400));
  }

  wishlist.products.push({ productId });

  await wishlist.save();

  return res.status(200).json({ message: 'Product was added to your wishlist successfully' });
});

exports.deleteFromWishlist = catchAsync(async (req, res, next) => {});
