const express = require("express");

const productController = require("../controllers/product.controller");

const productRouter = express.Router();

productRouter.route("/").get(productController.getAllProducts);

productRouter.route("/:productId").get(productController.getProductById);

productRouter.route("/category/:categoryName").get(productController.getAllProductsWithinCategory);

module.exports = productRouter;
