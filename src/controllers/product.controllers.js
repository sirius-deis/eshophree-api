const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const Product = require('../models/product.models');
const Discount = require('../models/discount.models');

const checkIfProductsListIsNotBlank = (next, products, message, statusCode) => {
    if (products.length < 1) {
        return next(new AppError(message, statusCode));
    }
};

exports.getAllProducts = catchAsync(async (req, res, next) => {
    const { skip = 0, limit = 10, category = [] } = req.query;
    const searchOptions = {};
    if (category.length) {
        searchOptions.category = { $in: [...category] };
    }
    const products = await Product.find(searchOptions)
        .skip(skip)
        .limit(limit)
        .populate('discount');
    checkIfProductsListIsNotBlank(
        next,
        products,
        'There are no products left',
        200
    );

    res.status(200).json({ message: 'Products were found', data: products });
});

exports.getProductById = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
        return next(
            AppError(`Product with id: ${productId} wasn't found`, 200)
        );
    }
    res.status(200).json({ message: 'Product was found', data: product });
});

exports.addProduct = catchAsync(async (req, res) => {
    const {
        name,
        text,
        category,
        brand,
        price,
        stock,
        desc,
        options,
        images,
        addition,
    } = req.body;

    await Product.create({
        name,
        text,
        category,
        brand,
        price,
        stock,
        desc,
        options,
        images,
        addition,
    });

    res.status(201).json({ message: 'Product was added successfully' });
});

exports.removeProduct = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
        return next(
            AppError(`Product with id: ${productId} wasn't found`, 404)
        );
    }

    await product.deleteOne();

    res.status(204).json({ message: 'Product was deleted successfully' });
});
