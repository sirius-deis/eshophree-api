const express = require('express');
const { isMongoId } = require('../utils/validator');

const {
    addDiscount,
    deleteDiscount,
    updateDiscount,
} = require('../controllers/discount.controllers');
const { isLoggedIn, restrictTo } = require('../middlewares/auth.middlewares');
const { findProduct } = require('../middlewares/product.middlewares');

const discountRouter = express.Router({ mergeParams: true });

discountRouter.use(isLoggedIn);
discountRouter.use(restrictTo('admin'));
discountRouter.use(isMongoId('productId'));

discountRouter.route('/').post(findProduct, addDiscount);

discountRouter.route('/').delete(findProduct, deleteDiscount);
discountRouter.route('/').delete(findProduct, updateDiscount);

module.exports = discountRouter;
