const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { addToMapIfValuesExist } = require('../utils/utils');
const { resizeAndSave, deleteFile } = require('../api/uploadFile');

const Product = require('../models/product.models');
const ProductCategory = require('../models/productCategory.models');
const ProductVendor = require('../models/productVendor.models');
const Image = require('../models/image.models');

const addToOptionsIfNotEmpty = (options, key, value) => {
  if (value && typeof value === 'string') {
    options[key] = { $all: [value] };
  } else if (Array.isArray(value)) {
    options[key] = { $all: [...value] };
  }
};

exports.getProductCategories = catchAsync(async (req, res) => {
  const productCategory = await ProductCategory.find().populate('imageId');

  res.status(200).json({
    message: 'Categories were found successfully',
    data: { productCategory },
  });
});

exports.addProductCategory = catchAsync(async (req, res) => {
  const { name, desc } = req.body;

  const { file } = req;

  const { buffer } = file;

  const cldResponse = await resizeAndSave(buffer, { width: 200, height: 200 }, 'jpeg', 'products');

  const image = await Image.create({
    fileUrl: cldResponse.secure_url,
    publicId: cldResponse.public_id,
  });

  await ProductCategory.create({ name, ImageId: image._id, desc });

  res.status(201).json({
    message: 'Category was added successfully',
  });
});

exports.editProductCategory = catchAsync(async (req, res) => {
  const { name, desc } = req.body;
  const { productCategoryId } = req.params;

  const { file } = req;

  const productCategory = await ProductCategory.findById(productCategoryId);

  let image;

  if (file) {
    const { buffer } = file;

    const cldResponse = await resizeAndSave(
      buffer,
      { width: 200, height: 200 },
      'jpeg',
      'products',
    );

    image = await Image.findById(productCategory.imageId);

    await deleteFile(image.publicId);

    image.fileUrl = cldResponse.secure_url;
    image.publicId = cldResponse.public_id;
  }

  productCategory.name = name;
  productCategory.desc = desc;

  await Promise.all([productCategory.save(), image?.save()]);

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

  const productCategory = await ProductCategory.findByIdAndDelete(productCategoryId).populate(
    'imageId',
  );

  await deleteFile(productCategory.imageId.publicId);

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
  const { companyCode, name, description, addressStreet, addressCity, addressPostalCode } =
    req.body;
  // eslint-disable-next-line max-len
  await ProductVendor.create({
    companyCode,
    name,
    description,
    addressStreet,
    addressCity,
    addressPostalCode,
  });

  res.status(201).json({
    message: 'Product vendor was added successfully',
  });
});

exports.editProductVendor = catchAsync(async (req, res, next) => {
  const { productVendorId } = req.params;
  // eslint-disable-next-line max-len
  const { companyCode, name, description, addressStreet, addressCity, addressPostalCode } =
    req.body;

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

exports.addTagsToProduct = catchAsync(async (req, res, next) => {
  const { product } = req;
  const { tags } = req.body;

  if (product.tags.length && product.tags.every((tag) => tags.includes(tag))) {
    return next(new AppError('This product already contains provided tags', 404));
  }

  const filteredTags = tags.filter((tag) => !product.tags.includes(tag));
  product.tags.push(...filteredTags);

  await product.save();

  res.status(200).json({ message: 'Tag was added to product successfully' });
});

exports.deleteTagsFromProduct = catchAsync(async (req, res, next) => {
  const { product } = req;
  const { tags } = req.body;

  if (product.tags.length && !product.tags.every((tag) => tags.includes(tag))) {
    return next(new AppError('This product does not contain provided tags', 404));
  }

  product.tags = product.tags.filter((tag) => !tags.includes(tag));

  await product.save();

  res.status(200).json({ message: 'Tag was added to product successfully' });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  //prettier-ignore
  // eslint-disable-next-line max-len
  const { limit = 10, page = 1, category, brand, price, rating, fields, search, tag } = req.query;
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

  if (rating !== undefined) {
    queryOptions.$or = [{ ratingAverage: { $gte: rating } }, { ratingAverage: { $exists: 0 } }];
  }

  if (search) {
    queryOptions.name = {
      $regex: search,
      $options: 'i',
    };
  }

  if (tag) {
    queryOptions.tags = { $in: [tag] };
  }

  const skip = limit * (page - 1);

  const fieldsToSelect = {};

  if (fields) {
    fields.split(',').forEach((field) => {
      fieldsToSelect[field] = 1;
    });
  }

  const documentCount = await Product.countDocuments(queryOptions);
  const products = await Product.find(queryOptions, fieldsToSelect)
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'discount',
      options: {
        select: {
          percent: 1,
        },
      },
    })
    .populate({
      path: 'imageIds',
      options: {
        $slice: 1,
      },
    });

  if (products.length < 1) {
    return next(new AppError('There are no products left', 200));
  }

  res
    .status(200)
    .json({ message: 'Products were found', data: { products, count: documentCount } });
});

exports.getProductById = catchAsync(async (req, res) => {
  const product = await req.product.populate([
    {
      path: 'discount',
      options: {
        select: {
          percent: 1,
        },
      },
    },
    {
      path: 'imageIds',
    },
  ]);
  res.status(200).json({ message: 'Product was found', data: product });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { product } = req;
  //prettier-ignore
  const { name, categoryId, sku, price, brandId, info, about, options, desc
  } = req.body;
  //prettier-ignore
  // eslint-disable-next-line max-len
  const map = addToMapIfValuesExist({ name, categoryId, sku, price, brandId, info, about, options, desc });

  if (!map) {
    return next(new AppError('Please provide all necessary fields', 400));
  }

  await product.updateOne(map, { runValidation: true });

  res.status(200).json({ message: 'Product was updated successfully' });
});

exports.deleteImageFromProduct = catchAsync(async (req, res, next) => {
  const product = await req.product.populate({
    path: 'imageIds',
  });
  const { imageId } = req.params;

  const image = await Image.findById(imageId);

  if (!image) {
    return next(new AppError('There is no image with such id', 404));
  }

  const imageIdIndex = product.imageIds.find((id) => id._id.equals(imageId));

  if (imageIdIndex === -1) {
    return next(new AppError('This image does not belong to this product', 404));
  }

  await Promise.all([
    image.deleteOne(),
    Product.updateOne(
      { _id: product._id },
      {
        $pull: {
          imageIds: imageId,
        },
      },
    ),
    deleteFile(image.publicId),
  ]);

  res.status(200).json({ message: 'Image was deleted successfully' });
});

exports.addProduct = catchAsync(async (req, res, next) => {
  //prettier-ignore
  const { name, categoryId, sku, price, brandId, info, about, options, desc,
  } = req.body;

  //prettier-ignore
  // eslint-disable-next-line max-len
  if (!Array.isArray(info) && info.length < 1 || !Array.isArray(about) && about.length < 1 || !Array.isArray(options) &&
    options.length < 1) {
    return next(new AppError('Please provide correct data', 400));
  }
  //prettier-ignore
  // eslint-disable-next-line max-len

  const promises = await Promise.all([ProductCategory.findById(categoryId), ProductVendor.findById(brandId)]);

  if (promises[0] === null || promises[1] === null) {
    return next(new AppError('There is no such category or brand', 404));
  }

  await Product.create({
    name,
    categoryId,
    sku,
    price,
    brandId,
    info,
    about,
    options,
    desc,
  });

  res.status(201).json({ message: 'Product was added successfully' });
});

exports.addImagesToProduct = catchAsync(async (req, res) => {
  const { product, files } = req;

  const imagePromises = [];

  for (let i = 0; i < files.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const cldResponse = await resizeAndSave(
      files[i].buffer,
      { width: 1200, height: 1200 },
      'jpeg',
      'products',
    );

    imagePromises.push(
      Image.create({
        fileUrl: cldResponse.secure_url,
        publicId: cldResponse.public_id,
      }),
    );
  }

  const imagesArr = await Promise.all(imagePromises);

  product.imageIds = imagesArr.map((image) => image._id);

  await product.save();

  res.status(200).json({ message: 'Images to product were added successfully' });
});

exports.deleteProduct = catchAsync(async (req, res) => {
  const product = await req.product.populate({
    path: 'imageIds',
    options: {
      select: {
        publicId: 1,
      },
    },
  });

  await Promise.all(product.imageIds.map((image) => deleteFile(image.publicId)));

  await product.deleteOne();

  res.status(204).send();
});
