const mongoose = require('mongoose');
const Review = require('./review.models');

const ReviewRatingSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [-1, "It can't be less then -1"],
      max: [1, "It can't be more then 1"],
    },
  },
  {
    collection: 'review-rating',
  },
);

ReviewRatingSchema.statics.calcRating = async function (reviewId) {
  const reviewsRating = await this.aggregate([
    {
      $match: {
        reviewId,
      },
    },
    {
      $group: {
        _id: '$reviewId',
        sum: {
          $sum: '$points',
        },
      },
    },
  ]);
  if (reviewsRating.length > 0) {
    await Review.findByIdAndUpdate(reviewId, {
      approves: reviewsRating[0].sum,
    });
  } else {
    await Review.findByIdAndUpdate(reviewId, {
      approves: 0,
    });
  }
};

ReviewRatingSchema.post('save', function () {
  this.constructor.calcRating(this.reviewId);
});

const ReviewRating = mongoose.model('ReviewRating', ReviewRatingSchema);

module.exports = ReviewRating;
