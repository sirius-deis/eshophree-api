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
const { isLoggedIn, restrictTo } = require('../middlewares/auth.middlewares');
const validator = require('../middlewares/validation.middlwares');
const { findProduct } = require('../middlewares/product.middlewares');
// eslint-disable-next-line object-curly-newline
const { isNthLength, isPrice, isIntWithMin, isMongoId, isGreaterThan, isMongoIdInBody } = require('../utils/validator');

const productRouter = express.Router();

productRouter.get('/categories', getProductCategories);

productRouter
  .route('/')
  .get(
    isGreaterThan({ field: 'skip', isOptional: true, gt: 0 }),
    isGreaterThan({ field: 'limit', isOptional: true, gt: 0 }),
    isGreaterThan({ field: 'minPrice', isOptional: true, gt: 0 }),
    isGreaterThan({ field: 'maxPrice', isOptional: true, gt: 0 }),
    isIntWithMin({ field: 'rating', isOptional: true, min: 1, max: 5 }),
    validator,
    getAllProducts,
  )
  .post(
    isLoggedIn,
    restrictTo('admin'),
    isMongoIdInBody({ field: 'categoryId' }),
    isMongoIdInBody({ field: 'brandId' }),
    isNthLength({ field: 'name', min: 5 }),
    isNthLength({ field: 'sku', min: 8 }),
    isPrice({ field: 'price' }),
    isNthLength({ field: 'desc', min: 10, max: 256 }),
    validator,
    addProduct,
  );

productRouter
  .route('/:productId')
  .get(isMongoId({ field: 'productId' }), validator, findProduct, getProductById)
  .patch(isLoggedIn, restrictTo('admin'), isMongoId({ field: 'productId' }), validator, findProduct, updateProduct)
  .delete(isLoggedIn, restrictTo('admin'), isMongoId({ field: 'productId' }), validator, findProduct, removeProduct);

productRouter.use('/:productId/reviews', reviewRouter);
productRouter.use('/:productId/discounts', discountRouter);
productRouter.use('/:productId/carts', cartRouter);

module.exports = productRouter;
