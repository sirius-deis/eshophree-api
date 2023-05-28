const mongoose = require('mongoose');

const ActivateTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: [
                true,
                "This field can't be empty please provide id of exiting user",
            ],
            ref: 'User',
            unique: true,
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
            validate: {
                validator: function (v) {
                    return v > Date.now();
                },
                message: props =>
                    `Value ${props.value} is invalid. Value of this field can't be a past time`,
            },
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
