const express = require('express');
const auth = require('../middlewares/auth.middlewares');
const reviewController = require('../controllers/review.controllers');

const reviewRouter = express.Router();

reviewRouter.use(auth.isLoggedIn);

reviewRouter.route('/').post(reviewController.addReview);

reviewRouter.route('/:reviewId').delete(reviewController.deleteReview);

module.exports = reviewRouter;
