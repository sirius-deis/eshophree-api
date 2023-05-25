const mongoose = require('mongoose');

const CartSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
        },
        products: [
            {
                productId: {
                    type: mongoose.Types.ObjectId,
                    ref: 'Product',
                },
                quantity: {
                    type: Number,
                    required: [true, "This field can't be blank"],
                    default: 0,
                },
            },
        ],
    },
    {
        toJSON: {
            transform: (doc, ret, options) => {
                delete ret.__v;
            },
        },
        _id: false,
    }
);

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
