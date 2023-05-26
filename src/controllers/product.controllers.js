const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const Product = require('../models/product.models');

const addToOptionsIfNotEmpty = (options, key, value) => {
    if (value && typeof value === 'string') {
        options[key] = { $all: [value] };
    } else if (Array.isArray(value)) {
        options[key] = { $all: [...value] };
    }
};

exports.getAllProducts = catchAsync(async (req, res, next) => {
    const {
        skip = 0,
        limit = 10,
        category,
        brand,
        maxPrice,
        minPrice,
        rating,
    } = req.query;
    const queryOptions = {};

    addToOptionsIfNotEmpty(queryOptions, 'categoryId', category);
    addToOptionsIfNotEmpty(queryOptions, 'brandId', brand);
    if (maxPrice || minPrice) {
        queryOptions.price = {};
        if (maxPrice) {
            queryOptions.price.$lte = maxPrice;
        }
        if (minPrice) {
            queryOptions.price.$gte = minPrice;
        }
    }
    console.log(rating);
    if (rating) {
        queryOptions.$or = [
            { ratingAverage: { $gte: rating } },
            { ratingAverage: { $exists: 0 } },
        ];
    }

    const products = await Product.find(
        queryOptions,
        'name price info images.0'
    )
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'discount',
            options: {
                select: {
                    percent: 1,
                },
            },
        });

    if (products.length < 1) {
        return next(new AppError('There are no products left', 200));
    }

    res.status(200).json({ message: 'Products were found', data: products });
});

exports.getProductById = catchAsync(async (req, res, next) => {
    const product = await req.product.populate({
        path: 'discount',
        options: {
            select: {
                percent: 1,
            },
        },
    });
    res.status(200).json({ message: 'Product was found', data: product });
});

exports.addProduct = catchAsync(async (req, res) => {
    const {
        name,
        category,
        sku,
        price,
        brandId,
        info,
        about,
        options,
        desc,
        images,
    } = req.body;

    await Product.create({
        name,
        category,
        sku,
        price,
        brandId,
        info,
        about,
        options,
        desc,
        images,
    });

    res.status(201).json({ message: 'Product was added successfully' });
});

exports.removeProduct = catchAsync(async (req, res, next) => {
    const product = req.product;
    await product.deleteOne();

    res.status(204).json({ message: 'Product was deleted successfully' });
});
