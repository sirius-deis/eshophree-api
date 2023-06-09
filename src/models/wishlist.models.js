const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: 'user',
  },
  products: [
    {
      productId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'product',
      },
    },
  ],
});

WishlistSchema.index({ userId: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

module.exports = Wishlist;
