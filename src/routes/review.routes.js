const express = require('express');
const auth = require('../middlewares/auth.middlewares');
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

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(auth.isLoggedIn);

reviewRouter.use(isMongoId('productId'));

reviewRouter
  .route('/')
  .get(getReviews)
  .post(isIntWithMin('rating', false, 1, 5), isNthLength('comment', 4, 256), validator, addReview);

reviewRouter
  .route('/:reviewId', validator)
  .patch(isIntWithMin('rating', true, 1, 5), isNthLength('comment', 4, 256), updateReview)
  .delete(deleteReview);

reviewRouter.route('/:reviewId/rates', validator).patch(rateReview).delete(unrateReview);

module.exports = reviewRouter;
