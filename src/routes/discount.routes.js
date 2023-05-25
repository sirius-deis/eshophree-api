const express = require('express');
const { isMongoId } = require('../utils/validator');

const {
    addDiscount,
    deleteDiscount,
    updateDiscount,
} = require('../controllers/discount.controllers');
const { isLoggedIn, restrictTo } = require('../middlewares/auth.middlewares');

const discountRouter = express.Router({ mergeParams: true });

discountRouter.use(isLoggedIn);
discountRouter.use(restrictTo('admin'));
discountRouter.use(isMongoId('productId'));

discountRouter.route('/').post(addDiscount);

discountRouter.route('/').delete(deleteDiscount);
discountRouter.route('/').delete(updateDiscount);

module.exports = discountRouter;
