const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Product',
            required: [
                true,
                "This field can't be empty please provide valid data",
            ],
        },
        quantity: {
            type: Number,
            min: 1,
            required: [
                true,
                "This field can't be empty please provide valid data",
            ],
        },
    },
    {
        collection: 'order-items',
    }
);

const OrderItem = mongoose.model('OrderItem', OrderItemSchema);

module.exports = OrderItem;
