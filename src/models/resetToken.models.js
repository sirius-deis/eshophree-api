const mongoose = require('mongoose');

const ResetTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: [
                true,
                "This field can't be empty please provide id of exiting user",
            ],
            ref: 'user',
        },
        token: {
            type: String,
            required: [
                true,
                "This field can't be empty please provide valid token",
            ],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            expires: 60 * 60 * 24,
            validate: {
                validator: function (v) {
                    return v < Date.now();
                },
                message: "This field can't be past date",
            },
        },
    },
    {
        timestamps: true,
        collection: 'reset-tokens',
    }
);

const ResetToken = mongoose.model('ResetToken', ResetTokenSchema);

module.exports = ResetToken;
