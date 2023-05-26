const mongoose = require('mongoose');

const ProductCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            required: true,
        },
    },
    {
        collection: 'production-category',
        toJSON: {
            transform: (doc, ret, options) => {
                delete ret.__v;
            },
        },
    }
);

const ProductCategory = mongoose.model(
    'ProductCategory',
    ProductCategorySchema
);

module.exports = ProductCategory;
