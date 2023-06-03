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

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(isLoggedIn);

reviewRouter.use(isMongoId({ field: 'productId' }));

reviewRouter
  .route('/')
  .get(getReviews)
  .post(
    isIntWithMin({ field: 'rating', isOptional: false, min: 1, max: 5 }),
    isNthLength({ field: 'comment', min: 4, max: 256 }),
    validator,
    addReview,
  );

reviewRouter
  .route('/:reviewId', validator)
  .patch(
    isIntWithMin({ field: 'rating', isOptional: true, min: 1, max: 5 }),
    isNthLength({ field: 'comment', min: 4, max: 256 }),
    updateReview,
  )
  .delete(deleteReview);

reviewRouter.route('/:reviewId/rates', validator).patch(rateReview).delete(unrateReview);

module.exports = reviewRouter;
