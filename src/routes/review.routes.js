const express = require('express');
const { param } = require('express-validator');
const auth = require('../middlewares/auth.middlewares');
const reviewController = require('../controllers/review.controllers');
const validator = require('../middlewares/validation.middlwares');
const { isIntWithMin, isNthLength } = require('../utils/validator');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(auth.isLoggedIn);

reviewRouter.use(param('productId').isMongoId());

reviewRouter.route('/').get(reviewController.getReviews);

reviewRouter
    .route('/')
    .post(
        isIntWithMin('rating', 1, 5),
        isNthLength('comment', 4, 256),
        validator,
        reviewController.addReview
    );

reviewRouter
    .route('/:reviewId')
    .delete(validator, reviewController.deleteReview);

reviewRouter
    .route('/:reviewId')
    .put(
        isIntWithMin('rating', 1, 5),
        isNthLength('comment', 4, 256),
        validator,
        reviewController.updateReview
    );

module.exports = reviewRouter;
