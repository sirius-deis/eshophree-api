const mongoose = require('mongoose');

const ProductCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxlength: [32, "Length can't be grater than 32 characters"],
      required: [true, "Category can't be without name"],
      unique: true,
    },
    desc: {
      type: String,
      maxlength: [128, "Length can't be grater than 128 characters"],
    },
    image: {
      type: String,
    },
    imageId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: [true, 'Please provide valid data'],
      ref: 'Image',
    },
  },
  {
    collection: 'product-categories',
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
      },
    },
  },
);

const ProductCategory = mongoose.model('ProductCategory', ProductCategorySchema);

module.exports = ProductCategory;
