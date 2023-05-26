const mongoose = require('mongoose');

const ProductVendorSchema = new mongoose.Schema(
    {
        companyCode: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        addressStreet: {
            type: String,
        },
        addressCity: {
            type: String,
        },
        addressPostalCode: {
            type: String,
        },
    },
    {
        toJSON: {
            transform: (doc, ret, options) => {
                delete ret.__v;
            },
        },
        collection: 'product-vendors',
    }
);

const ProductVendor = mongoose.model('ProductVendor', ProductVendorSchema);

module.exports = ProductVendor;
