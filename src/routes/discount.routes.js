const express = require('express');
const { isMongoId } = require('../utils/validator');

// eslint-disable-next-line object-curly-newline
const { getDiscount, addDiscount, deleteDiscount, updateDiscount } = require('../controllers/discount.controllers');
const { isLoggedIn, restrictTo } = require('../middlewares/auth.middlewares');
const { findProduct } = require('../middlewares/product.middlewares');
const validator = require('../middlewares/validation.middlwares');

const discountRouter = express.Router({ mergeParams: true });

discountRouter.route('/').get(findProduct, getDiscount);

discountRouter.use(isLoggedIn);
discountRouter.use(restrictTo('admin'));
discountRouter.use(isMongoId({ field: 'productId' }));
discountRouter.use(validator);

discountRouter
  .route('/')
  .post(findProduct, addDiscount)
  .patch(findProduct, updateDiscount)
  .delete(findProduct, deleteDiscount);

module.exports = discountRouter;
