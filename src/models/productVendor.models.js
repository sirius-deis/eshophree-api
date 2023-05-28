const mongoose = require('mongoose');

const ProductVendorSchema = new mongoose.Schema(
    {
        companyCode: {
            type: String,
            maxlength: [64, "This field can't be longer than 64 characters"],
            required: true,
            unique: true,
        },
        name: {
            type: String,
            maxlength: [32, "This field can't be longer than 32 characters"],
            required: true,
        },
        description: {
            type: String,
            maxlength: [128, "This field can't be longer than 128 characters"],
        },
        addressStreet: {
            type: String,
            maxlength: [32, "This field can't be longer than 32 characters"],
        },
        addressCity: {
            type: String,
            maxlength: [16, "This field can't be longer than 16 characters"],
        },
        addressPostalCode: {
            type: String,
            maxlength: [16, "This field can't be longer than 16 characters"],
        },
    },
    {
        toJSON: {
            transform: (doc, ret) => {
                delete ret.__v;
            },
        },
        collection: 'product-vendors',
    }
);

const ProductVendor = mongoose.model('ProductVendor', ProductVendorSchema);

module.exports = ProductVendor;
