// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./db');
const { redisConnect, redisDisconnect } = require('../db/redis');
const User = require('../models/user.models');
const Product = require('../models/product.models');
const Discount = require('../models/discount.models');
const app = require('../app');
const makeRequest = require('./makeRequest');

describe('/discounts', () => {
  let product;
  let product2;
  let product3;
  beforeAll(async () => {
    await connect();
    await redisConnect();
    const discount = await Discount.create({ percent: 20, till: new Date(2023, 10, 9) });
    product = await Product.create({
      name: 'Product 1',
      categoryId: '64777d65c584ff381b29ee4e',
      price: 500,
      brandId: '64777d65c584ff381b39ee4e',
      images: [''],
      ratingAverage: 5,
      discountId: discount._id,
    });
    product2 = await Product.create({
      name: 'Product 2',
      categoryId: '64777d65c584ff381b29ee4e',
      price: 500,
      brandId: '64777d65c584ff381b39ee4e',
      images: [''],
      ratingAverage: 5,
    });
    product3 = await Product.create({
      name: 'Product 3',
      categoryId: '64777d65c584ff381b29ee4e',
      price: 500,
      brandId: '64777d65c584ff381b39ee4e',
      images: [''],
      ratingAverage: 5,
      discountId: '64777d65c584ff331b39ee4e',
    });
  });
  afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
    await redisDisconnect();
  });
  describe('/ get', () => {
    it('should return 404 as there is no such product', (done) => {
      makeRequest({
        method: 'get',
        route: 'products/6443a5541c7998fe4bdebd26/discounts',
        statusCode: 404,
        expectedResult: 'There is no product with such id. Please try again',
        done,
      });
    });
    it('should return 404 as there is no such discount for this product', (done) => {
      makeRequest({
        method: 'get',
        route: `products/${product2._id}/discounts`,
        statusCode: 404,
        expectedResult: 'There is no discount for this product',
        done,
      });
    });
    it('should return 404 as there is no such discount for this product', (done) => {
      makeRequest({
        method: 'get',
        route: `products/${product3._id}/discounts`,
        statusCode: 404,
        expectedResult: 'There is no such discount with this product',
        done,
      });
    });
    it('should return 200', (done) => {
      makeRequest({
        method: 'get',
        route: `products/${product._id}/discounts`,
        statusCode: 200,
        expectedResult: 'Discount was fount successfully',
        done,
      });
    });
  });
});
