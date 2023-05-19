const Review = require('../models/review.model');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const checkFieldsPresence = require('../utils/utils');

exports.addReview = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { productId, rating, review } = req.body;

    const reviewEntity = await Review.findOne({ userId: user._id, productId });

    if (reviewEntity) {
        return next(
            new AppError(
                "You can't add more than one review to each product.",
                400
            )
        );
    }

    checkFieldsPresence(next, rating, review);

    await Review.create({
        userId: user._id,
        productId,
        rating: +rating,
        comment: review,
    });

    res.status(201).json({ message: 'Your review was added successfully.' });
});

//TODO: refactor
exports.deleteReview = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { reviewId } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
        next(new AppError('There is no review with such id', 404));
    }

    if (review.userId !== user._id) {
        return next(
            new AppError(
                "You don't have enough rights to delete this review.",
                402
            )
        );
    }

    await review.deleteOne();

    res.status(204).json({ message: 'Your review was deleted successfully.' });
});

//TODO: refactor
exports.updateReview = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { reviewId } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
        return next(new AppError('There is no review with such id', 404));
    }

    if (review.userId !== user._id) {
        return next(
            new AppError(
                "You don't have enough rights to delete this review.",
                402
            )
        );
    }
});
