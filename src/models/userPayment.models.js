const mongoose = require('mongoose');

const UserPaymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        paymentType: {
            type: String,
            enum: [
                'cash',
                'check',
                'debit card',
                'credit card',
                'mobile payments',
                'bank transfer',
            ],
        },
        provider: {
            type: String,
        },
    },
    {
        collection: 'user-payment',
    }
);

const UserPayment = mongoose.model('UserPayment', UserPaymentSchema);

module.exports = UserPayment;
