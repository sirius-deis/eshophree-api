const { Readable } = require('stream');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const cld = require('./cloudinary');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. Please provide appropriate data', 400), false);
  }
};

const bufferToStream = (buffer) => {
  const readable = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
  return readable;
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadPhoto = (option) => upload.single(option);

exports.uploadArrayOfPhoto = (options) => upload.array(options);

exports.resizeAndSave = async (buffer, { width, height }, format, subfolder) => {
  const data = await sharp(buffer)
    .resize(width, height)
    .toFormat(format)
    [format]({ quality: 50 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const stream = cld.v2.uploader.upload_stream(
      {
        folder: `chatty_pal/${subfolder}`,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );
    bufferToStream(data).pipe(stream);
  });
};

exports.deleteFile = async (publicId) => cld.v2.uploader.destroy(publicId);
