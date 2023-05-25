const mongoose = require('mongoose');

const OrderDetailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    price: {
        type: Number,
        require: true,
    },
    statusId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'OrderStatus',
    },
    comment: {
        type: String,
    },
});

const OrderDetails = mongoose.model('OrderDetails', OrderDetailsSchema);

module.exports = OrderDetails;
