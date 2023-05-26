const mongoose = require('mongoose');

const ActivateTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
            ref: 'User',
        },
        token: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: 'activate-token',
    }
);

const ActivateToken = mongoose.model('ActivateToken', ActivateTokenSchema);

module.exports = ActivateToken;
