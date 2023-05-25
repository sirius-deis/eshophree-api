const mongoose = require('mongoose');

const ProductCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
});

const ProductCategory = mongoose.model(
    'ProductCategory',
    ProductCategorySchema
);

module.exports = ProductCategory;
