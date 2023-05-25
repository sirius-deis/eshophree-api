const mongoose = require('mongoose');

const OrderItemsSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'OrderDetails',
        required: true,
    },
    productId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});

const Order = mongoose.model('OrderItems', OrderItemsSchema);

module.exports = Order;
