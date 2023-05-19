const express = require('express');

const productController = require('../controllers/product.controllers');
const auth = require('../middlewares/auth.middlewares');

const productRouter = express.Router();

productRouter
    .route('/')
    .get(productController.getAllProducts)
    .post(auth.restrictTo('admin'), productController.addProduct);

productRouter
    .route('/:productId')
    .get(productController.getProductById)
    .delete(auth.restrictTo('admin'), productController.removeProduct);

productRouter
    .route('/category/:categoryName')
    .get(productController.getAllProductsWithinCategory);

module.exports = productRouter;
