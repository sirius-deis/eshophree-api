const mongoose = require('mongoose');

const UserPaymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        paymentType: {
            type: String,
        },
    },
    {
        collection: 'user-payment',
    }
);

const UserPayment = mongoose.model('UserPayment', UserPaymentSchema);

module.exports = UserPayment;
