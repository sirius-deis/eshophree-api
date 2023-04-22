const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const Product = require("../models/product.model");

const brands = ["Brand1", "Brand2", "Brand3", "Brand4", "Brand5", "Brand6", "Brand7", "Brand8", "Brand9", "Brand10"];

exports.getAllProducts = catchAsync(async (req, res) => {
    const products = await Product.find();
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
