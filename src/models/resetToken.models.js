const mongoose = require('mongoose');

const ResetTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
            ref: 'user',
        },
        token: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            expires: 60 * 60 * 24,
        },
    },
    {
        timestamps: true,
        collection: 'reset-token',
    }
);

const ResetToken = mongoose.model('ResetToken', ResetTokenSchema);

module.exports = ResetToken;
