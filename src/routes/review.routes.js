const express = require('express');
const { isLoggedIn } = require('../middlewares/auth.middlewares');
const {
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  rateReview,
  unrateReview,
} = require('../controllers/review.controllers');
const validator = require('../middlewares/validation.middlwares');
const { isIntWithMin, isNthLength, isMongoId } = require('../utils/validator');
const { findProduct } = require('../middlewares/product.middlewares');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(isMongoId({ field: 'productId' }));
reviewRouter.use(findProduct);

reviewRouter
  .route('/')
  .get(getReviews)
  .post(
    isLoggedIn,
    isIntWithMin({ field: 'rating', isOptional: false, min: 1, max: 5 }),
    isNthLength({ field: 'comment', min: 4, max: 256 }),
    validator,
    addReview,
  )
  .patch(
    isLoggedIn,
    isIntWithMin({ field: 'rating', isOptional: true, min: 1, max: 5 }),
    isNthLength({ field: 'comment', min: 4, max: 256 }),
    updateReview,
  )
  .delete(isLoggedIn, deleteReview);

reviewRouter.use(isLoggedIn);

reviewRouter.route('/:reviewId', validator).patch(rateReview).delete(unrateReview);

module.exports = reviewRouter;
