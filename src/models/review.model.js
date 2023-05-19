const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now(),
        require: true,
    },
    editedAt: {
        type: Date,
    },
});

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
