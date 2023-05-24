const express = require('express');
const { query } = require('express-validator');
const {
    getAllProducts,
    addProduct,
    getProductById,
    removeProduct,
    getAllProductsWithinCategory,
} = require('../controllers/product.controllers');
const reviewRouter = require('./review.routes');
const discountRouter = require('./discount.routes');
const auth = require('../middlewares/auth.middlewares');
const {
    isNthLength,
    isPrice,
    isIntWithMin,
    isMongoId,
} = require('../utils/validator');
const validator = require('../middlewares/validation.middlwares');

const productRouter = express.Router();

const skipQuery = query('skip').isInt({ gt: 0 });
const limitQuery = query('skip').isInt({ gt: 0 });

productRouter
    .route('/')
    .get(skipQuery, limitQuery, validator, getAllProducts)
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
        addProduct
    );

productRouter
    .route('/:productId')
    .get(isMongoId('productId'), getProductById)
    .delete(auth.restrictTo('admin'), isMongoId('productId'), removeProduct);

productRouter
    .route('/category/:categoryName')
    .get(skipQuery, limitQuery, validator, getAllProductsWithinCategory);

productRouter.use('/:productId/reviews', reviewRouter);
productRouter.use('/:productId/discounts', discountRouter);

module.exports = productRouter;
