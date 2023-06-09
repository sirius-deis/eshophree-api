const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. Please provide appropriate data', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadPhoto = (option) => upload.single(option);

exports.uploadArrayOfPhoto = (options) => upload.array(options);

exports.resizeAndSave = async (buffer, { width, height }, format, path) => {
  await sharp(buffer).resize(width, height).toFormat(format)[format]({ quality: 50 }).toFile(path);
};

exports.createFolderIfNotExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (err) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

exports.deletePhotoIfExists = async (path) => {
  try {
    await fs.unlink(path);
  } catch {}
};
