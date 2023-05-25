const mongoose = require('mongoose');

const OrderStatusSchema = new mongoose.Schema({
    statusCode: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});

const OrderStatus = mongoose.model('OrderStatus', OrderStatusSchema);

module.exports = OrderStatus;
