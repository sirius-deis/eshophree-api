const Review = require('../models/review.model');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const chooseReviewFields = fields => {
    const map = {};
    let isOnePresent = false;
    for (const key in fields) {
        if (fields[key]) {
            map[key] = fields[key];
            isOnePresent = true;
        }
    }
    return isOnePresent && map;
};

exports.getReviews = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const reviews = await Review.find({ productId });
    if (reviews.length) {
        return next(new AppError('There is no review on this product', 404));
    }
    res.status(200).json({
        message: 'Review on selected product were found',
        data: { reviews },
    });
});

exports.addReview = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const reviewEntity = await Review.findOne({ userId: user._id, productId });

    if (reviewEntity) {
        return next(
            new AppError(
                "You can't add more than one review to each product.",
                400
            )
        );
    }

    await Review.create({
        userId: user._id,
        productId,
        rating: +rating,
        comment,
    });

    res.status(201).json({ message: 'Your review was added successfully.' });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { reviewId } = req.params;

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

exports.updateReview = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { rating, comment } = req.body;
    const { reviewId } = req.params;

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

    const fields = chooseReviewFields({ rating, comment });
    if (!fields) {
        return next(new AppError('Please change at lease one field', 400));
    }

    for (const name in fields) {
        review[name] = fields[name];
    }

    await review.save();

    res.status(200).json({ message: 'Your review was successfully updated' });
});
