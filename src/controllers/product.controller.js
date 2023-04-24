const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const Product = require("../models/product.model");

const checkIfProductsListIsNotBlank = (products, message) => {
    if (products.length < 1) {
        throw new AppError(message, 404);
    }
    return false;
};

exports.getAllProducts = catchAsync(async (req, res) => {
    const { skip = 0, limit = 10 } = req.query;
    const products = await Product.find().skip(skip).limit(limit);
    checkIfProductsListIsNotBlank(products, "There are no products left");

    res.status(200).json({ message: "Products were found", data: products });
});

exports.getAllProductsWithinCategory = catchAsync(async (req, res) => {
    const { categoryName } = req.params;
    const { skip = 0, limit = 10 } = req.query;

    const products = await Product.find({ category: categoryName }).skip(skip).limit(limit);
    checkIfProductsListIsNotBlank(products, "There are no products with such category left");

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
