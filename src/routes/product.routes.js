const express = require('express');
const {
    getProductCategories,
    getAllProducts,
    addProduct,
    getProductById,
    removeProduct,
    updateProduct,
} = require('../controllers/product.controllers');
const reviewRouter = require('./review.routes');
const discountRouter = require('./discount.routes');
const cartRouter = require('./cart.routes');
const auth = require('../middlewares/auth.middlewares');
const validator = require('../middlewares/validation.middlwares');
const { findProduct } = require('../middlewares/product.middlewares');
const {
    isNthLength,
    isPrice,
    isIntWithMin,
    isMongoId,
    isGreaterThan,
    isMongoIdInBody,
} = require('../utils/validator');

const productRouter = express.Router();

productRouter.get('/categories', getProductCategories);

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
        auth.isLoggedIn,
        auth.restrictTo('admin'),
        isMongoIdInBody('categoryId'),
        isMongoIdInBody('brandId'),
        isNthLength('name', 5),
        isNthLength('sku', 8),
        isPrice('price'),
        isNthLength('desc', 10, 256),
        validator,
        addProduct
    );

productRouter
    .route('/:productId')
    .get(isMongoId('productId'), validator, findProduct, getProductById)
    .patch(
        auth.isLoggedIn,
        auth.restrictTo('admin'),
        isMongoId('productId'),
        validator,
        findProduct,
        updateProduct
    )
    .delete(
        auth.isLoggedIn,
        auth.restrictTo('admin'),
        isMongoId('productId'),
        validator,
        findProduct,
        removeProduct
    );

productRouter.use('/:productId/reviews', reviewRouter);
productRouter.use('/:productId/discounts', discountRouter);
productRouter.use('/:productId/carts', cartRouter);

module.exports = productRouter;
