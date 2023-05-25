const mongoose = require('mongoose');

const Product = require('./product.models');

const ReviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
            ref: 'user',
        },
        productId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
            ref: 'product',
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
        },
    },
    {
        toJSON: {
            transform: (doc, ret, options) => {
                delete ret.__v;
            },
        },
        _id: false,
        timestamps: true,
    }
);

ReviewSchema.statics.calcAverageRating = async function (productId) {
    const reviews = await this.aggregate([
        {
            $match: {
                productId,
            },
        },
        {
            $group: {
                _id: '$productId',
                numberOfReviews: {
                    $sum: 1,
                },
                averageRating: {
                    $avg: '$rating',
                },
            },
        },
    ]);

    if (reviews.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            ratingQuantity: reviews[0].numberOfReviews,
            ratingAverage: reviews[0].averageRating,
        });
    } else {
        await Product.findById(productId, {
            ratingQuantity: 0,
        });
    }
};

ReviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.productId);
});

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
