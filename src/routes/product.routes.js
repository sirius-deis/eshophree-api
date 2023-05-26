const express = require('express');
const {
    getAllProducts,
    addProduct,
    getProductById,
    removeProduct,
} = require('../controllers/product.controllers');
const reviewRouter = require('./review.routes');
const discountRouter = require('./discount.routes');
const auth = require('../middlewares/auth.middlewares');
const validator = require('../middlewares/validation.middlwares');
const { findProduct } = require('../middlewares/product.middlewares');
const {
    isNthLength,
    isPrice,
    isIntWithMin,
    isMongoId,
    isGreaterThan,
} = require('../utils/validator');

const productRouter = express.Router();

productRouter
    .route('/')
    .get(
        isGreaterThan('skip', true, 0),
        isGreaterThan('limit', true, 0),
        isGreaterThan('minPrice', true, 0),
        isGreaterThan('maxPrice', true, 0),
        isIntWithMin('rating', true, 1, 5),
        validator,
        getAllProducts
    )
    .post(
        isNthLength('name', 5),
        isNthLength('text', 10),
        isNthLength('category', 5),
        isNthLength('brand', 2),
        isPrice('price'),
        isIntWithMin('stock', false, 1),
        isNthLength('desc', 30, 256),
        isNthLength('addition', 10, 256),
        validator,
        auth.restrictTo('admin'),
        addProduct
    );

productRouter
    .route('/:productId')
    .get(isMongoId('productId'), findProduct, getProductById)
    .delete(
        auth.restrictTo('admin'),
        isMongoId('productId'),
        findProduct,
        removeProduct
    );

productRouter.use('/:productId/reviews', reviewRouter);
productRouter.use('/:productId/discounts', discountRouter);

module.exports = productRouter;
