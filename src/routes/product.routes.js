const express = require('express');
const {
  getProductCategories,
  addProductCategory,
  editProductCategory,
  deleteProductCategory,
  getAllProducts,
  addProduct,
  getProductById,
  deleteProduct,
  updateProduct,
  getProductVendorsList,
  addProductVendor,
  editProductVendor,
  deleteProductVendor,
  addTagsToProduct,
  deleteTagsFromProduct,
  temp,
} = require('../controllers/product.controllers');
const reviewRouter = require('./review.routes');
const discountRouter = require('./discount.routes');
const cartRouter = require('./cart.routes');
const wishlistRouter = require('./wishlist.routes');
const { isLoggedIn, restrictTo } = require('../middlewares/auth.middlewares');
const validator = require('../middlewares/validation.middlwares');
const { findProduct } = require('../middlewares/product.middlewares');
// eslint-disable-next-line object-curly-newline
const {
  isNthLength,
  isPrice,
  isIntWithMin,
  isMongoId,
  isGreaterThan,
  isMongoIdInBody,
  isArray,
} = require('../utils/validator');
const { uploadPhoto } = require('../api/file');

const productRouter = express.Router();

productRouter.use('/:productId/reviews', reviewRouter);
productRouter.use('/:productId/discounts', discountRouter);
productRouter.use('/:productId/carts', cartRouter);
productRouter.use('/:productId/wishlist', wishlistRouter);

productRouter.get('/categories', getProductCategories);
productRouter.get('/vendors', getProductVendorsList);

productRouter.get('/temp', temp);

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
  .route('/:productId/tags')
  .patch(isLoggedIn, restrictTo('admin'), isArray('tags'), findProduct, addTagsToProduct)
  .delete(isLoggedIn, restrictTo('admin'), isArray('tags'), findProduct, deleteTagsFromProduct);

productRouter
  .route('/:productId')
  .get(isMongoId({ field: 'productId' }), validator, findProduct, getProductById)
  .patch(
    isLoggedIn,
    restrictTo('admin'),
    isMongoId({ field: 'productId' }),
    validator,
    findProduct,
    updateProduct,
  )
  .delete(
    isLoggedIn,
    restrictTo('admin'),
    isMongoId({ field: 'productId' }),
    validator,
    findProduct,
    deleteProduct,
  );

productRouter
  .route('/categories/')
  .post(
    isLoggedIn,
    restrictTo('admin'),
    uploadPhoto('photo'),
    isNthLength({ field: 'name', min: '3' }),
    isNthLength({ field: 'desc', min: 16 }),
    validator,
    addProductCategory,
  );

productRouter
  .route('/categories/:productCategoryId')
  .put(
    isLoggedIn,
    restrictTo('admin'),
    uploadPhoto('photo'),
    isNthLength({ field: 'name', min: '3' }),
    isNthLength({ field: 'desc', min: 16 }),
    validator,
    editProductCategory,
  )
  .delete(isLoggedIn, restrictTo('admin'), deleteProductCategory);

productRouter
  .route('/vendors/')
  .post(
    isLoggedIn,
    restrictTo('admin'),
    isNthLength({ field: 'companyCode', min: '3' }),
    isNthLength({ field: 'name', min: 2 }),
    isNthLength({ field: 'description', min: '16' }),
    isNthLength({ field: 'addressStreet', min: 4 }),
    isNthLength({ field: 'addressCity', min: '4' }),
    isNthLength({ field: 'addressPostalCode', min: 4 }),
    validator,
    addProductVendor,
  );

productRouter
  .route('/vendors/:productVendorId')
  .put(
    isLoggedIn,
    restrictTo('admin'),
    isNthLength({ field: 'companyCode', min: '3' }),
    isNthLength({ field: 'name', min: 2 }),
    isNthLength({ field: 'description', min: '16' }),
    isNthLength({ field: 'addressStreet', min: 4 }),
    isNthLength({ field: 'addressCity', min: '4' }),
    isNthLength({ field: 'addressPostalCode', min: 4 }),
    validator,
    editProductVendor,
  )
  .delete(isLoggedIn, restrictTo('admin'), deleteProductVendor);

module.exports = productRouter;
