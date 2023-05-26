const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema(
    {
        percent: {
            type: Number,
            min: 0,
            max: 100,
        },
        till: {
            type: Date,
            required: true,
        },
    },
    {
        toJSON: {
            transform: (doc, ret) => {
                delete ret.__v;
                delete ret._id;
            },
        },
        timestamps: true,
    }
);

const Discount = mongoose.model('Discount', DiscountSchema);

module.exports = Discount;
