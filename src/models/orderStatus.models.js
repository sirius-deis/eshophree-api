const mongoose = require('mongoose');

const OrderStatusSchema = new mongoose.Schema(
    {
        statusCode: {
            type: String,
            enum: [
                'waiting',
                'started',
                'processing',
                'completed',
                'discarded',
            ],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
    },
    {
        collection: 'order-status',
    }
);

const OrderStatus = mongoose.model('OrderStatus', OrderStatusSchema);

module.exports = OrderStatus;
