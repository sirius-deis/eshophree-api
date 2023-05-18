const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema({
    productId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'product',
    },
    amount: {
        type: Number,
        min: 0,
        max: 100,
    },
    addedAt: {
        type: Date,
        default: Date.now(),
        required: true,
    },
    till: {
        type: Date,
        required: true,
    },
});

const Discount = mongoose.model('Discount', DiscountSchema);

module.exports = Discount;
