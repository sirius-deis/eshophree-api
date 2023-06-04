const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./db');
const { redisConnect, redisDisconnect } = require('../db/redis');
const User = require('../models/user.models');
const Product = require('../models/product.models');
const Review = require('../models/review.models');
const app = require('../app');
const makeRequest = require('./makeRequest');

describe('/reviews', () => {
  let product;
  let product2;
  let product3;
  let token;
  let user2;
  beforeAll(async () => {
    await connect();
    await redisConnect();

    const user = await User.create({
      email: 'test@test.com',
      password: 'password123',
      role: 'admin',
      active: true,
    });
    user2 = await User.create({
      email: 'test2@test.com',
      password: 'password123',
      role: 'user',
      active: true,
    });
    product = await Product.create({
      name: 'Product 1',
      categoryId: '64777d65c584ff381b29ee4e',
      price: 500,
      brandId: '64777d65c584ff381b39ee4e',
      images: [''],
      ratingAverage: 5,
    });
    await Review.create({ userId: user._id, productId: product._id, rating: 4, comment: 'some comment', approves: 18 });
    product2 = await Product.create({
      name: 'Product 2',
      categoryId: '64777d65c584ff381b29ee4e',
      price: 500,
      brandId: '64777d65c584ff381b39ee4e',
      images: [''],
      ratingAverage: 4,
    });
    await Review.create({
      userId: user2._id,
      productId: product2._id,
      rating: 4,
      comment: 'some comment',
      approves: 18,
    });
    product3 = await Product.create({
      name: 'Product 3',
      categoryId: '64777d65c584ff381b29ee4e',
      price: 500,
      brandId: '64777d65c584ff381b39ee4e',
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

  describe('/ get route', () => {
    it('should return 404', (done) => {
      makeRequest({
        method: 'get',
        route: `products/${product3._id}/reviews`,
        expectedResult: 'There is no review on this product',
        statusCode: 404,
        done,
      });
    });
    it('should return 200', (done) => {
      makeRequest({
        method: 'get',
        route: `products/${product._id}/reviews`,
        expectedResult: 'Review on selected product were found',
        statusCode: 200,
        done,
      });
    });
  });
  describe('/ post route', () => {
    it('should return 401', (done) => {
      makeRequest({
        method: 'post',
        route: `products/${product._id}/reviews`,
        expectedResult: 'Sign in before trying to access this route',
        statusCode: 401,
        done,
      });
    });
    it('should return 400', (done) => {
      makeRequest({
        method: 'post',
        route: `products/${product._id}/reviews`,
        body: {
          rating: 2,
          comment: 'Cool',
        },
        expectedResult: "You can't add more than one review to each product.",
        statusCode: 400,
        done,
        token,
      });
    });
    it('should return 201', (done) => {
      makeRequest({
        method: 'post',
        route: `products/${product2._id}/reviews`,
        body: {
          rating: 4,
          comment: 'Cool',
        },
        expectedResult: 'Your review was added successfully.',
        statusCode: 201,
        done,
        token,
      });
    });
  });
  describe('/ delete route', () => {
    it('should return 401', (done) => {
      makeRequest({
        method: 'delete',
        route: `products/${product._id}/reviews`,
        expectedResult: 'Sign in before trying to access this route',
        statusCode: 401,
        done,
      });
    });
    it('should return 204', (done) => {
      makeRequest({
        method: 'delete',
        route: `products/${product2._id}/reviews`,
        isContentTypePresent: false,
        statusCode: 204,
        done,
        token,
      });
    });
    it('should return 404', (done) => {
      makeRequest({
        method: 'delete',
        route: `products/${product2._id}/reviews`,
        expectedResult: 'There is no review with such id',
        statusCode: 404,
        done,
        token,
      });
    });
  });
  describe('/ update route', () => {
    it('should return 401', (done) => {
      makeRequest({
        method: 'patch',
        route: `products/${product._id}/reviews`,
        expectedResult: 'Sign in before trying to access this route',
        statusCode: 401,
        done,
      });
    });
    it('should return 404', (done) => {
      makeRequest({
        method: 'patch',
        route: `products/${product2._id}/reviews`,
        expectedResult: 'There is no review for such product',
        statusCode: 404,
        done,
        token,
      });
    });
    it('should return 400', (done) => {
      makeRequest({
        method: 'patch',
        route: `products/${product._id}/reviews`,
        expectedResult: 'Please change at lease one field',
        statusCode: 400,
        done,
        token,
      });
    });
    it('should return 200', (done) => {
      makeRequest({
        method: 'patch',
        route: `products/${product._id}/reviews`,
        body: {
          rating: 3,
        },
        expectedResult: 'Your review was successfully updated',
        statusCode: 200,
        done,
        token,
      });
    });
  });
  describe('/:reviewId patch route', () => {
    it('should return 401', (done) => {
      Review.findOne({ productId: product._id }).then((review) => {
        makeRequest({
          method: 'patch',
          route: `products/${product._id}/reviews/${review._id}`,
          expectedResult: 'Sign in before trying to access this route',
          statusCode: 401,
          done,
        });
      });
    });
    it('should return 400', (done) => {
      Review.findOne({ productId: product._id }).then((review) => {
        makeRequest({
          method: 'patch',
          route: `products/${product2._id}/reviews/${review._id}`,
          body: { rating: 3 },
          expectedResult: 'Wrong value. This value is not allowed',
          statusCode: 400,
          done,
          token,
        });
      });
    });
    it('should return 404', (done) => {
      makeRequest({
        method: 'patch',
        route: `products/${product2._id}/reviews/64777d65c584ff381b29ee4e`,
        body: { rating: 1 },
        statusCode: 404,
        expectedResult: 'There is no review with such id',
        done,
        token,
      });
    });
    it('should return 400', (done) => {
      Review.findOne({ productId: product._id }).then((review) => {
        makeRequest({
          method: 'patch',
          route: `products/${product2._id}/reviews/${review._id}`,
          body: { rating: 1 },
          expectedResult: "You can't rate your own reviews",
          statusCode: 400,
          done,
          token,
        });
      });
    });
    it('should return 201', (done) => {
      Review.findOne({ productId: product2._id, userId: user2._id }).then((review) => {
        makeRequest({
          method: 'patch',
          route: `products/${product2._id}/reviews/${review._id}`,
          body: { rating: 1 },
          expectedResult: 'Review was rated successfully',
          statusCode: 201,
          done,
          token,
        });
      });
    });
  });
  describe('/:reviewId delete route', () => {
    it('should return 401', (done) => {
      Review.findOne({ productId: product._id }).then((review) => {
        makeRequest({
          method: 'delete',
          route: `products/${product._id}/reviews/${review._id}`,
          expectedResult: 'Sign in before trying to access this route',
          statusCode: 401,
          done,
        });
      });
    });
    it('should return 404', (done) => {
      makeRequest({
        method: 'delete',
        route: `products/${product._id}/reviews/64777d65c584ff381b29ee4e`,
        statusCode: 404,
        expectedResult: 'There is no review with such id',
        done,
        token,
      });
    });
    it('should return 204', (done) => {
      Review.findOne({ productId: product2._id, userId: user2._id }).then((review) => {
        makeRequest({
          method: 'delete',
          route: `products/${product2._id}/reviews/${review._id}`,
          isContentTypePresent: false,
          statusCode: 204,
          done,
          token,
        });
      });
    });
  });
});
