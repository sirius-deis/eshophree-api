const express = require('express');
const { query } = require('express-validator');
const productController = require('../controllers/product.controllers');
const reviewRouter = require('./review.routes');
const auth = require('../middlewares/auth.middlewares');
const { isNthLength, isPrice, isIntWithMin } = require('../utils/validator');
const validator = require('../middlewares/validation.middlwares');

const productRouter = express.Router();

const skipQuery = query('skip').isInt({ gt: 0 });
const limitQuery = query('skip').isInt({ gt: 0 });

productRouter
    .route('/')
    .get(skipQuery, limitQuery, validator, productController.getAllProducts)
    .post(
        isNthLength('name', 5),
        isNthLength('text', 10),
        isNthLength('category', 5),
        isNthLength('brand', 2),
        isPrice('price'),
        isIntWithMin('stock', 1),
        isNthLength('desc', 30, 256),
        isNthLength('addition', 10, 256),
        validator,
        auth.restrictTo('admin'),
        productController.addProduct
    );

productRouter
    .route('/:productId')
    .get(productController.getProductById)
    .delete(auth.restrictTo('admin'), productController.removeProduct);

productRouter
    .route('/category/:categoryName')
    .get(
        skipQuery,
        limitQuery,
        validator,
        productController.getAllProductsWithinCategory
    );

productRouter.use('/:productId/reviews', reviewRouter);

module.exports = productRouter;
