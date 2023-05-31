const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Product = require('../models/product.models');

exports.findProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError('There is no product with such id. Please try again', 404));
  }

  req.product = product;
  next();
});
