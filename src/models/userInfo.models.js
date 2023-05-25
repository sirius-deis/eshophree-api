const mongoose = require('mongoose');

const UserInfoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    addressStreet: {
        type: String,
    },
    city: {
        type: String,
    },
    postalCode: {
        type: String,
    },
    country: {
        type: String,
    },
    telephone: {
        type: String,
    },
    mobile: {
        type: String,
    },
});

const UserInfo = mongoose.model('UserInfo', UserInfoSchema);

module.exports = UserInfo;
