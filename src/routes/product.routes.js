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
const {
    isNthLength,
    isPrice,
    isIntWithMin,
    isMongoId,
    isArray,
    isGreaterThan,
} = require('../utils/validator');
const validator = require('../middlewares/validation.middlwares');

const productRouter = express.Router();

productRouter
    .route('/')
    .get(
        isGreaterThan('skip', true, 0),
        isGreaterThan('limit', true, 0),
        isArray('category', true),
        validator,
        getAllProducts
    )
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

productRouter.use('/:productId/reviews', reviewRouter);
productRouter.use('/:productId/discounts', discountRouter);

module.exports = productRouter;
