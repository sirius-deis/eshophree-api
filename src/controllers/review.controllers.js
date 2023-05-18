const Review = require('../models/review.model');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const checkFieldsPresence = require('../utils/utils');

exports.addReview = catchAsync(async (req, res) => {
    const user = req.user;
    const { productId, rating, review } = req.body;

    const reviewEntity = await Review.findOne({ userId: user._id, productId });

    if (reviewEntity) {
        throw new AppError(
            "You can't add more than one review to each product.",
            400
        );
    }

    checkFieldsPresence(rating, review);

    await Review.create({
        userId: user._id,
        productId,
        rating: +rating,
        comment: review,
    });

    res.status(201).json({ message: 'Your review was added successfully' });
});
