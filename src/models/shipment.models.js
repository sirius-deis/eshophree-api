const mongoose = require('mongoose');

const ShipmentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Order',
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    trackingNumber: {
        type: String,
        required: true,
    },
    sentAt: {
        type: Date,
    },
});

const Shipment = mongoose.model('Shipment', ShipmentSchema);

module.exports = Shipment;
