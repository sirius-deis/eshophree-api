const mongoose = require('mongoose');

const Product = require('./product.models');

const ReviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: [
                true,
                "This field can't be empty please provide id of exiting user",
            ],
            ref: 'user',
        },
        productId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: [
                true,
                "This field can't be empty please provide id of exiting product",
            ],
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
            maxlength: [256, "Length can't be more than 256 characters"],
            minlength: [16, "Length can't be less than 16 characters"],
        },
    },
    {
        toJSON: {
            transform: (doc, ret) => {
                delete ret.__v;
            },
        },
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
