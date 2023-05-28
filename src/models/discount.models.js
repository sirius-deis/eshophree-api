const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema(
    {
        percent: {
            type: Number,
            min: 1,
            max: 100,
            required: [
                true,
                "This field can't be empty. Please provide valid number between 1 and 100",
            ],
        },
        till: {
            type: Date,
            validate: {
                validator: function (v) {
                    return v > Date.now();
                },
                message: props =>
                    `Value ${props.value} is incorrect. Please provide valid data`,
            },
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
