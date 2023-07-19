const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "This field can't be empty. Provide a name"],
      maxlength: [128, 'Name is too long. Max number of characters is 128'],
    },
    categoryId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: [true, 'Please provide valid data'],
      ref: 'ProductCategory',
    },
    sku: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "This field can't be blank. Please provide valid data"],
      min: 1,
      get: (price) => `$${price.toFixed(2)}`,
    },
    brandId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: [true, "This field can't be empty. Please provide correct data"],
      ref: 'ProductVendor',
    },
    info: [
      {
        title: {
          type: String,
          maxlength: [64, 'Length is too long. Max length is 64 characters'],
        },
        item: {
          type: String,
        },
      },
    ],
    about: {
      type: [String],
    },
    options: [
      {
        title: String,
        optArr: [
          {
            opt: {
              type: String,
              maxlength: 64,
              required: [true, "This field can't be empty. Please provide correct data"],
            },
            plusToPrice: {
              type: Number,
              min: 1,
              required: [true, "This field can't be empty. Please provide correct data"],
            },
          },
        ],
      },
    ],
    desc: {
      type: String,
      maxlength: [2048, "'Length is too long. Max length is 2048 characters"],
    },
    images: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        required: [true, 'Please provide valid data'],
        ref: 'Picture',
      },
    ],
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    ratingAverage: {
      type: Number,
      min: 1,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    discountId: {
      type: mongoose.SchemaTypes.ObjectId,
    },
    tags: {
      type: [String],
    },
    colors: {
      type: [String],
      required: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.discountId;
        delete ret.id;
      },
    },
  },
);

productSchema.virtual('discount', {
  ref: 'Discount',
  localField: 'discountId',
  foreignField: '_id',
  justOne: true,
});

productSchema.pre('find', function (next) {
  this.populate('categoryId', 'name').populate('brandId', 'name');
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
