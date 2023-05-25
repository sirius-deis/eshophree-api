const catchAsync = require('../utils/catchAsync');
const Discount = require('../models/discount.models');

exports.addDiscount = catchAsync(async (req, res, next) => {
    const { percent, till } = req.body;
    const product = req.product;

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
    const product = req.product;

    await Discount.findByIdAndDelete(product.discountId);

    res.status(204).json({ message: 'Discount was successfully deleted' });
});

exports.updateDiscount = catchAsync(async (req, res, next) => {
    const { percent, till } = req.body;
    const product = req.product;

    await Discount.findByIdAndUpdate(
        product.discountId,
        { till, percent },
        { runValidators: true }
    );

    res.status(204).json({ message: 'Discount was successfully deleted' });
});
