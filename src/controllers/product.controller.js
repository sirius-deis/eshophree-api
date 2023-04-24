const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const Product = require("../models/product.model");

exports.getAllProducts = catchAsync(async (req, res) => {
    const { skip = 0, limit = 10 } = req.query;
    const products = await Product.find().skip(skip).limit(limit);
    res.status(200).json({ message: "Products were found", data: products });
});

exports.getAllProductsWithinCategory = catchAsync(async (req, res) => {
    const { categoryName } = req.params;

    const products = await Product.find({ category: categoryName });

    res.status(200).json({ message: "Products with given category were found", data: products });
});

exports.getProductById = catchAsync(async (req, res) => {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
        new AppError(`Product with id: ${productId} wasn't found`, 404);
    }
    res.status(200).json({ message: "Product was found", data: product });
});
