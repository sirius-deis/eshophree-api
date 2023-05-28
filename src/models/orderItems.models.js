const mongoose = require('mongoose');

const OrderItemsSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'OrderDetails',
            required: [
                true,
                "This field can't be empty please provide valid data",
            ],
        },
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

const Order = mongoose.model('OrderItems', OrderItemsSchema);

module.exports = Order;
