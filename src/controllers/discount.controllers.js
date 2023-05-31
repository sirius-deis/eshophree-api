const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Discount = require('../models/discount.models');

exports.getDiscount = catchAsync(async (req, res, next) => {
  const { product } = req;
  const discount = await Discount.findById({ productId: product._id });
  if (!discount) {
    return next(new AppError('There is no such discount with this product', 404));
  }

  res.status(200).json({
    message: 'Discount was fount successfully',
    data: { discount },
  });
});

exports.addDiscount = catchAsync(async (req, res) => {
  const { percent, till } = req.body;
  const { product } = req;

  await Discount.findOneAndDelete({ productId: product._id });

  const discount = await Discount.create({
    productId: product._id,
    percent,
    till: new Date(till),
  });

  product.discountId = discount._id;

  await product.save();

  res.status(201).json({ message: 'Discount was successfully added' });
});

exports.deleteDiscount = catchAsync(async (req, res, next) => {
  const { product } = req;

  const discount = await Discount.findByIdAndDelete(product.discountId);

  if (!discount) {
    return next(new AppError('There is no such discount with this product', 404));
  }

  res.status(204).send();
});

exports.updateDiscount = catchAsync(async (req, res, next) => {
  const { percent, till } = req.body;
  const { product } = req;

  const discount = await Discount.findByIdAndUpdate(
    product.discountId,
    { till, percent },
    { runValidators: true },
  );

  if (!discount) {
    return next(new AppError('There is no such discount with this product', 404));
  }

  res.status(204).json({ message: 'Discount was successfully deleted' });
});
