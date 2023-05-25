const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema(
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
    },
    {
        timestamps: true,
    }
);

const Token = mongoose.model('Token', TokenSchema);

module.exports = Token;
