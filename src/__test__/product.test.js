// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./db');
const { redisConnect, redisDisconnect } = require('../db/redis');
const User = require('../models/user.models');
const Product = require('../models/product.models');
const app = require('../app');
const makeRequest = require('./makeRequest');

describe('/products', () => {
  const categoryId = '6470493869a7e6e93c73c15a';
  const brandId = '6470509a84eda2141def7ad9';
  let token;
  beforeAll(async () => {
    await connect();
    await redisConnect();
    await User.create({
      email: 'test@test.com',
      password: 'password123',
      role: 'admin',
      active: true,
    });
    await Product.create({
      name: 'Product 1',
      categoryId: categoryId,
      price: 500,
      brandId: brandId,
      images: [''],
      ratingAverage: 5,
    });
    await Product.create({
      name: 'Product 2',
      categoryId: categoryId,
      price: 700,
      brandId: brandId,
      images: [''],
      ratingAverage: 4,
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
  describe('/categories route', () => {
    it('should return 200', (done) => {
      makeRequest({
        method: 'get',
        route: 'products/categories',
        statusCode: 200,
        done,
        expectedResult: 'Categories were found successfully',
      });
    });
  });
  describe('/ get route', () => {
    it('should return 200', (done) => {
      makeRequest({
        method: 'get',
        route: 'products?fields=name',
        statusCode: 200,
        done,
        expectedResult: 'Products were found',
        data: true,
      });
    });
    it('should return 200 as there are no products in this price range', (done) => {
      makeRequest({
        method: 'get',
        route: 'products?price=>200<400',
        statusCode: 200,
        done,
        expectedResult: 'There are no products left',
      });
    });
    it('should return 200 with rating query', (done) => {
      makeRequest({
        method: 'get',
        route: 'products?rating=4',
        statusCode: 200,
        done,
        expectedResult: 'Products were found',
        data: true,
      });
    });
    it('should return 200 with products by search query', (done) => {
      makeRequest({
        method: 'get',
        route: 'products?search=product',
        statusCode: 200,
        done,
        expectedResult: 'Products were found',
        data: true,
      });
    });
  });
  describe('/:productId get', () => {
    it('should return 400 as there is not mongo id', (done) => {
      makeRequest({
        method: 'get',
        route: 'products/123',
        statusCode: 400,
        done,
        expectedResult: [
          "Invalid value. Field 'productId' with value '123' doesn't pass validation. Please provide correct data",
        ],
      });
    });
    it('should return 404 as there is no product with such id', (done) => {
      makeRequest({
        method: 'get',
        route: 'products/647057379cd597cc0c2c6ede',
        statusCode: 404,
        done,
        expectedResult: 'There is no product with such id. Please try again',
      });
    });
    it('should return 200 and return product', (done) => {
      Product.findOne({ name: 'Product 1' }).then((product) => {
        makeRequest({
          method: 'get',
          route: `products/${product._id}`,
          statusCode: 200,
          done,
          expectedResult: 'Product was found',
          data: true,
        });
      });
    });
  });
  describe('/:productId update', () => {
    it('should return 400', (done) => {
      Product.findOne({ name: 'Product 1' }).then((product) => {
        makeRequest({
          method: 'patch',
          route: `products/${product._id}`,
          statusCode: 400,
          body: {},
          done,
          expectedResult: 'Please provide all necessary fields',
          token,
        });
      });
    });
    it('should return 200', (done) => {
      Product.findOne({ name: 'Product 1' }).then((product) => {
        makeRequest({
          method: 'patch',
          route: `products/${product._id}`,
          statusCode: 200,
          body: {
            sku: '38024910532',
          },
          done,
          expectedResult: 'Product was updated successfully',
          token,
        });
      });
    });
  });
  describe('/:productId add', () => {
    it('should return 400', (done) => {
      makeRequest({
        method: 'post',
        route: 'products',
        statusCode: 400,
        body: {},
        done,
        expectedResult: [
          "Invalid value. Field 'categoryId' with value 'undefined' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'brandId' with value 'undefined' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'name' with value '' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'sku' with value '' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'price' with value 'undefined' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'desc' with value '' doesn't pass validation. Please provide correct data",
        ],
        token,
      });
    });
    it('should return 201', (done) => {
      makeRequest({
        method: 'post',
        route: 'products',
        statusCode: 201,
        body: {
          name: 'Product 3',
          categoryId,
          sku: '24252424',
          price: 254,
          brandId,
          info: [
            { title: 'title', item: 'some text' },
            { title: 'title', item: 'some text' },
          ],
          about: ['some text', 'some text'],
          options: [
            {
              title: 'title',
              optArr: [
                {
                  opt: 'some text',
                  plusToPrice: 100,
                },
              ],
            },
            {
              title: 'title',
              optArr: [
                {
                  opt: 'some text',
                  plusToPrice: 100,
                },
              ],
            },
          ],
          desc: 'Some description with length at lease 10',
          images: ['image'],
        },
        done,
        expectedResult: 'Product was added successfully',
        token,
      });
    });
  });
  describe('/:productId delete', () => {
    it('should return 204', (done) => {
      Product.findOne({ name: 'Product 1' }).then((product) => {
        makeRequest({
          method: 'delete',
          route: `products/${product._id}`,
          isContentTypePresent: false,
          statusCode: 204,
          body: {},
          done,
          expectedResult: undefined,
          token,
        });
      });
    });
  });
});
