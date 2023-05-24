const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema({
    percent: {
        type: Number,
        min: 0,
        max: 100,
    },
    createdAt: {
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
