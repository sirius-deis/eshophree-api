const mongoose = require('mongoose');

const PictureSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
  },
});

const Picture = mongoose.model('Picture', PictureSchema);

module.exports = Picture;
