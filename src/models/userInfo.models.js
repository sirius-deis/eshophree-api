const mongoose = require('mongoose');

const UserInfoSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        addressStreet: {
            type: String,
            maxlength: [32, "This field can't be longer than 32 characters"],
        },
        city: {
            type: String,
            maxlength: [16, "This field can't be longer than 16 characters"],
        },
        postalCode: {
            type: String,
            maxlength: [16, "This field can't be longer than 16 characters"],
        },
        country: {
            type: String,
            maxlength: [16, "This field can't be longer than 16 characters"],
        },
        telephone: {
            type: String,
        },
        mobile: {
            type: String,
        },
    },
    {
        collection: 'user-info',
    }
);

const UserInfo = mongoose.model('UserInfo', UserInfoSchema);

module.exports = UserInfo;
