const express = require("express");

const productController = require("../controllers/product.controller");
const cartRouter = require("./cart.routes");

const productRouter = express.Router();

productRouter.route("/").get(productController.getAllProducts);

productRouter.route("/:productId").get(productController.getProductById);
productRouter.use("/:productId/cart", cartRouter);

productRouter.route("/category/:categoryName").get(productController.getAllProductsWithinCategory);

module.exports = productRouter;
