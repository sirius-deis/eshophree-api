const path = require('path');
const fs = require('fs');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { addToMapIfValuesExist } = require('../utils/utils');
const { resizeAndSave } = require('../api/file');

const Product = require('../models/product.models');
const ProductCategory = require('../models/productCategory.models');
const ProductVendor = require('../models/productVendor.models');

const { IMAGE_FOLDER } = process.env;
const dirPath = path.resolve(__dirname, '..', IMAGE_FOLDER);

const addToOptionsIfNotEmpty = (options, key, value) => {
  if (value && typeof value === 'string') {
    options[key] = { $all: [value] };
  } else if (Array.isArray(value)) {
    options[key] = { $all: [...value] };
  }
};

exports.getProductCategories = catchAsync(async (req, res) => {
  const productCategory = await ProductCategory.find();

  res.status(200).json({
    message: 'Categories were found successfully',
    data: { productCategory },
  });
});

exports.addProductCategory = catchAsync(async (req, res) => {
  const { name, desc } = req.body;

  const { file } = req;

  try {
    await fs.access(dirPath);
  } catch (err) {
    await fs.mkdir(dirPath, { recursive: true });
  }

  const { buffer, originalName } = file;
  const timestamp = new Date().toISOString();
  const fileName = `${timestamp}-${originalName}`;
  const filePath = `${dirPath}/${fileName}`;

  await resizeAndSave(buffer, { width: 200, height: 200 }, 'jpeg', filePath);

  await ProductCategory.create({ name, image: fileName, desc });

  res.status(201).json({
    message: 'Category was added successfully',
  });
});

exports.editProductCategory = catchAsync(async (req, res) => {
  const { name, desc } = req.body;
  const { productCategoryId } = req.params;

  const { file } = req;

  const productCategory = await ProductCategory.findById(productCategoryId);

  if (file) {
    const { buffer, originalName } = file;
    const timestamp = new Date().toISOString();
    const fileName = `${timestamp}-${originalName}`;
    const filePath = `${dirPath}/${fileName}`;

    await resizeAndSave(buffer, { width: 200, height: 200 }, 'jpeg', filePath);

    try {
      await fs.unlink(`${dirPath}/${productCategory.image}`);
    } catch {}

    productCategory.image = fileName;
  }

  productCategory.name = name;
  productCategory.desc = desc;

  await productCategory.save();

  res.status(200).json({
    message: 'Category was updated successfully',
  });
});

exports.deleteProductCategory = catchAsync(async (req, res, next) => {
  const { withProducts } = req.body;
  const { productCategoryId } = req.params;

  if (withProducts) {
    await Product.deleteMany({ categoryId: productCategoryId });
  }

  const productCategory = await ProductCategory.findByIdAndDelete(productCategoryId);

  try {
    await fs.unlink(`${dirPath}/${productCategory.image}`);
  } catch {}

  if (!productCategory) {
    return next(new AppError('There is no product category with such id', 404));
  }

  res.status(204).send();
});

exports.getProductVendorsList = catchAsync(async (req, res) => {
  const productVendors = await ProductVendor.find();

  res.status(200).json({
    message: 'Product vendors were retrieved successfully',
    data: { productVendors },
  });
});

exports.addProductVendor = catchAsync(async (req, res) => {
  // eslint-disable-next-line max-len
  const { companyCode, name, description, addressStreet, addressCity, addressPostalCode } = req.body;
  // eslint-disable-next-line max-len
  await ProductVendor.create({ companyCode, name, description, addressStreet, addressCity, addressPostalCode });

  res.status(201).json({
    message: 'Product vendor was added successfully',
  });
});

exports.editProductVendor = catchAsync(async (req, res, next) => {
  const { productVendorId } = req.params;
  // eslint-disable-next-line max-len
  const { companyCode, name, description, addressStreet, addressCity, addressPostalCode } = req.body;

  const productVendor = await ProductVendor.findByIdAndUpdate(productVendorId, {
    companyCode,
    name,
    description,
    addressStreet,
    addressCity,
    addressPostalCode,
  });

  if (!productVendor) {
    return next(new AppError('There is no product vendor with such id', 404));
  }

  res.status(200).json({
    message: 'Product vendor was updated successfully',
  });
});

exports.deleteProductVendor = catchAsync(async (req, res, next) => {
  const { productVendorId } = req.params;

  const productVendor = await ProductVendor.findByIdAndDelete(productVendorId);

  if (!productVendor) {
    return next(new AppError('There is no product vendor with such id', 404));
  }

  res.status(204).send();
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  //prettier-ignore
  const { limit = 10, page = 1, category, brand, price, rating, sort, fields, search} = req.query;
  const queryOptions = {};

  addToOptionsIfNotEmpty(queryOptions, 'categoryId', category);
  addToOptionsIfNotEmpty(queryOptions, 'brandId', brand);

  if (price) {
    const operatorsMap = {
      '<': '$lt',
      '<=': '$lte',
      '=': '$eq',
      '>': '$gt',
      '>=': '$gte',
    };

    const filters = price.replace(/(<|<=|=|>|>=)/g, (match) => `-${operatorsMap[match]}:`);

    queryOptions.price = filters
      .slice(1)
      .split('-')
      .reduce((acc, filter) => {
        const filterArr = filter.split(':');
        acc[filterArr[0]] = filterArr[1];
        return acc;
      }, {});
  }

  if (rating) {
    queryOptions.$or = [{ ratingAverage: { $gte: rating } }, { ratingAverage: { $exists: 0 } }];
  }

  if (search) {
    queryOptions.name = {
      $regex: search,
      $options: 'i',
    };
  }

  const skip = limit * (page - 1);

  const fieldsToSelect = {};

  if (fields) {
    fields.split(',').forEach((field) => {
      if (field === 'images') {
        fieldsToSelect[field] = {
          $slice: 1,
        };
      } else {
        fieldsToSelect[field] = 1;
      }
    });
  }

  const documentCount = await Product.countDocuments({ queryOptions });

  const products = await Product.find(queryOptions, fieldsToSelect)
    .skip(skip)
    .limit(limit)
    .sort((sort && sort.replace(/[, ]/g, ' ')) || 'createdAt')
    .populate({
      path: 'discount',
      options: {
        select: {
          percent: 1,
        },
      },
    });

  if (products.length < 1) {
    return next(new AppError('There are no products left', 200));
  }

  res.status(200).json({ message: 'Products were found', data: { products, count: documentCount } });
});

exports.getProductById = catchAsync(async (req, res) => {
  const product = await req.product.populate({
    path: 'discount',
    options: {
      select: {
        percent: 1,
      },
    },
  });
  res.status(200).json({ message: 'Product was found', data: product });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { product } = req;
  //prettier-ignore
  const { name, categoryId, sku, price, brandId, info, about, options, desc, images,
  } = req.body;
  //prettier-ignore
  // eslint-disable-next-line max-len
  const map = addToMapIfValuesExist({ name, categoryId, sku, price, brandId, info, about, options, desc, images });

  if (!map) {
    return next(new AppError('Please provide all necessary fields', 400));
  }

  await product.updateOne(map, { runValidation: true });

  res.status(200).json({ message: 'Product was updated successfully' });
});

exports.addProduct = catchAsync(async (req, res, next) => {
  //prettier-ignore
  const { name, categoryId, sku, price, brandId, info, about, options, desc, images,
  } = req.body;
  //prettier-ignore
  // eslint-disable-next-line max-len
  if (!Array.isArray(info) && info.length < 1 || !Array.isArray(about) && about.length < 1 || !Array.isArray(options) &&
    options.length < 1 || Array.isArray(images) && images.length < 1) {
    return next(new AppError('Please provide correct data', 400));
  }
  //prettier-ignore
  // eslint-disable-next-line max-len
  await Product.create({ name, categoryId, sku, price, brandId, info, about, options, desc, images });

  res.status(201).json({ message: 'Product was added successfully' });
});

exports.removeProduct = catchAsync(async (req, res) => {
  const { product } = req;
  await product.deleteOne();

  res.status(204).send();
});
