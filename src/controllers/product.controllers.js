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
    const { limit = 10, page, category, brand, price, rating, sort, fields} = req.query;
    const queryOptions = {};

    addToOptionsIfNotEmpty(queryOptions, 'categoryId', category);
    addToOptionsIfNotEmpty(queryOptions, 'brandId', brand);

    if (price) {
        const operatorsMap = {
            '<': '$lt',
            '<=': '$lte',
            '=': '$eq',
            '>': '$gt',
            '>=': '$gte',
        };

        const filters = price.replace(/(<|<=|=|>|>=)/g, match => {
            return `-${operatorsMap[match]}:`;
        });

        queryOptions.price = filters
            .slice(1)
            .split('-')
            .reduce((acc, filter) => {
                const filterArr = filter.split(':');
                acc[filterArr[0]] = filterArr[1];
                return acc;
            }, {});
    }

    if (rating) {
        queryOptions.$or = [
            { ratingAverage: { $gte: rating } },
            { ratingAverage: { $exists: 0 } },
        ];
    }

    const skip = limit * (page - 1);

    const fieldsToSelect = {};

    if (fields) {
        fields.split(',').forEach(field => {
            if (field === 'images') {
                fieldsToSelect[field] = {
                    $slice: 1,
                };
            } else {
                fieldsToSelect[field] = 1;
            }
        });
    }

    const products = await Product.find(queryOptions, fieldsToSelect)
        .skip(skip)
        .limit(limit)
        .sort((sort && sort.replace(/[, ]/g, ' ')) || 'createdAt')
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

exports.getProductById = catchAsync(async (req, res) => {
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
    const map = addToObjectIfValuesExist({ name, category, sku, price, brand, info, about, options, desc, images });

    if (!map) {
        return next(new AppError('Please provide all necessary fields', 400));
    }

    await product.updateOne(map);

    res.status(200).json({ message: 'Project was updated successfully' });
});

exports.addProduct = catchAsync(async (req, res, next) => {
    //prettier-ignore
    const { name, category, sku, price, brand, info, about, options, desc, images,
    } = req.body;
    //prettier-ignore
    if (!Array.isArray(info) && info.length < 1 || !Array.isArray(about) && about.length < 1 || !Array.isArray(options) &&
        options.length < 1 || Array.isArray(images) && images.length < 1) {
        return next(new AppError('Please provide correct data', 400));
    }
    //prettier-ignore
    await Product.create({ name, categoryId: category, sku, price, brandId: brand, info, about, options, desc, images});

    res.status(201).json({ message: 'Product was added successfully' });
});

exports.removeProduct = catchAsync(async (req, res) => {
    const product = req.product;
    await product.deleteOne();

    res.status(204).send();
});
