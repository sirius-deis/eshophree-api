const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { addToObjectIfValuesExist } = require('../utils/utils');

const Product = require('../models/product.models');

const addToOptionsIfNotEmpty = (options, key, value) => {
    if (value && typeof value === 'string') {
        options[key] = { $all: [value] };
    } else if (Array.isArray(value)) {
        options[key] = { $all: [...value] };
    }
};

exports.getAllProducts = catchAsync(async (req, res, next) => {
    //prettier-ignore
    const { skip = 0, limit = 10, category, brand, maxPrice, minPrice, rating} = req.query;
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
    if (rating) {
        queryOptions.$or = [
            { ratingAverage: { $gte: rating } },
            { ratingAverage: { $exists: 0 } },
        ];
    }

    const products = await Product.find(queryOptions, {
        name: 1,
        price: 1,
        info: 1,
        ratingQuantity: 1,
        ratingAverage: 1,
        images: {
            $slice: 1,
        },
    })
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

    console.log(products[0]);
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

exports.updateProduct = catchAsync(async (req, res, next) => {
    const product = req.product;
    //prettier-ignore
    const { name, category, sku, price, brand, info, about, options, desc, images,
    } = req.body;
    //prettier-ignore
    const map = addToObjectIfValuesExist( name, category, sku, price, brand, info, about, options, desc, images);

    await product.update(map);

    res.status(200).json({ message: 'Project was updated successfully' });
});

exports.addProduct = catchAsync(async (req, res) => {
    //prettier-ignore
    const { name, category, sku, price, brand, info, about, options, desc, images,
    } = req.body;
    //prettier-ignore
    if (!name && !category && !sku && !price && !brand && !desc && !Array.isArray(info) &&
        info.length < 1 && !Array.isArray(about) && about.length < 1 && !Array.isArray(options) &&
        options.length < 1 && Array.isArray(images) && images.length < 1) {
        return next(new AppError('Please provide correct data', 400));
    }
    //prettier-ignore
    await Product.create({ name, categoryId: category, sku, price, brandId: brand, info, about, options, desc, images});

    res.status(201).json({ message: 'Product was added successfully' });
});

exports.removeProduct = catchAsync(async (req, res, next) => {
    const product = req.product;
    await product.deleteOne();

    res.status(204).json({ message: 'Product was deleted successfully' });
});
