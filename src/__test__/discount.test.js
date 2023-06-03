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
  let token;
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

    await User.create({
      email: 'test@test.com',
      password: 'password123',
      role: 'admin',
      active: true,
    });
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'test@test.com', password: 'password123' });
    token = response.body.token;
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
  describe('/ post', () => {
    it("should return 401 as user don't have access to this route", (done) => {
      makeRequest({
        method: 'post',
        route: 'products/6443a5541c7998fe4bdebd26/discounts',
        statusCode: 401,
        expectedResult: 'Sign in before trying to access this route',
        done,
      });
    });
    it('should return 404 as there is no such product', (done) => {
      makeRequest({
        method: 'post',
        route: 'products/6443a5541c7998fe4bdebd26/discounts',
        statusCode: 404,
        expectedResult: 'There is no product with such id. Please try again',
        done,
        token,
      });
    });
    it('should return 400 as there is incorrect values', (done) => {
      makeRequest({
        method: 'post',
        route: `products/${product._id}/discounts`,
        body: {},
        statusCode: 400,
        expectedResult: 'Please provide valid data',
        done,
        token,
      });
    });
    it('should return 400 as there is incorrect values', (done) => {
      makeRequest({
        method: 'post',
        route: `products/${product._id}/discounts`,
        body: {},
        statusCode: 400,
        expectedResult: 'Please provide valid data',
        done,
        token,
      });
    });
    it('should return 400 as there is incorrect values', (done) => {
      makeRequest({
        method: 'post',
        route: `products/${product._id}/discounts`,
        body: {
          percent: 30,
          till: '2023-9-12',
        },
        statusCode: 400,
        expectedResult: 'Please provide valid data',
        done,
        token,
      });
    });
    it('should return 200 and create a new discount for instead existed one', (done) => {
      makeRequest({
        method: 'post',
        route: `products/${product._id}/discounts`,
        body: {
          percent: 20,
          till: '2023-09-10',
        },
        statusCode: 201,
        expectedResult: 'Discount was successfully added',
        done,
        token,
      });
    });
  });
  describe('/ patch', () => {
    it("should return 401 as user don't have access to this route", (done) => {
      makeRequest({
        method: 'patch',
        route: 'products/6443a5541c7998fe4bdebd26/discounts',
        statusCode: 401,
        expectedResult: 'Sign in before trying to access this route',
        done,
      });
    });
    it('should return 404 as there is no such product', (done) => {
      makeRequest({
        method: 'patch',
        route: 'products/6443a5541c7998fe4bdebd26/discounts',
        statusCode: 404,
        expectedResult: 'There is no product with such id. Please try again',
        done,
        token,
      });
    });
    it('should return 404 as there is no such product', (done) => {
      makeRequest({
        method: 'patch',
        route: `products/${product2._id}/discounts`,
        statusCode: 404,
        expectedResult: 'There is no such discount with this product',
        done,
        token,
      });
    });
    it('should return 200 as there is no such product', (done) => {
      makeRequest({
        method: 'patch',
        route: `products/${product._id}/discounts`,
        statusCode: 200,
        expectedResult: 'Discount was successfully updated',
        done,
        token,
      });
    });
  });
  describe('/ delete', () => {
    it("should return 401 as user don't have access to this route", (done) => {
      makeRequest({
        method: 'delete',
        route: 'products/6443a5541c7998fe4bdebd26/discounts',
        statusCode: 401,
        expectedResult: 'Sign in before trying to access this route',
        done,
      });
    });
    it('should return 404 as there is no such product', (done) => {
      makeRequest({
        method: 'delete',
        route: 'products/6443a5541c7998fe4bdebd26/discounts',
        statusCode: 404,
        expectedResult: 'There is no product with such id. Please try again',
        done,
        token,
      });
    });
    it('should return 404 as there is no such discount', (done) => {
      makeRequest({
        method: 'delete',
        route: `products/${product2._id}/discounts`,
        statusCode: 404,
        expectedResult: 'There is no such discount for this product',
        done,
        token,
      });
    });
    it('should return 204', (done) => {
      makeRequest({
        method: 'delete',
        route: `products/${product._id}/discounts`,
        statusCode: 204,
        isContentTypePresent: false,
        done,
        token,
      });
    });
  });
});
