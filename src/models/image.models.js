const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
  },
});

const Image = mongoose.model('Image', ImageSchema);

module.exports = Image;
