const express = require("express");

const productController = require("../controllers/product.cotroller");

const productRouter = express.Router();

productRouter.route("/").get(productController.getAllProducts);

productRouter.route("/:productId").get(productController.getProductById);

productRouter.route("/category/:categoryName").get(productController.getAllProductsWithinCategory);

module.exports = productRouter;
