const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Discount = require('../models/discount.models');
const Product = require('../models/product.models');

exports.addDiscount = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const { percent, till } = req.body;
    const discount = await Discount.create({ percent, till: new Date(till) });

    const product = await Product.findById(productId);

    product.discountId = discount._id;

    await product.save();

    res.status(201).json({ message: 'Discount was successfully added' });
});

exports.deleteDiscount = catchAsync(async (req, res, next) => {
    res.status(204).json({ message: 'Discount was successfully deleted' });
});
