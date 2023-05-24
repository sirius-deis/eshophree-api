const express = require('express');
const { isMongoId } = require('../utils/validator');

const { addDiscount } = require('../controllers/discount.controllers');
const { isLoggedIn, restrictTo } = require('../middlewares/auth.middlewares');

const discountRouter = express.Router({ mergeParams: true });

discountRouter
    .route('/')
    .post(isLoggedIn, restrictTo('admin'), isMongoId('productId'), addDiscount);

module.exports = discountRouter;
