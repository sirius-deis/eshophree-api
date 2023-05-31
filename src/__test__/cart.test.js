// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./db');
const { redisConnect, redisDisconnect } = require('../db/redis');
const User = require('../models/user.models');
const Cart = require('../models/cart.models');
const app = require('../app');
const makeRequest = require('./makeRequest');

describe('/carts', () => {
  let token = '';
  let cart;

  beforeAll(async () => {
    await connect();
    await redisConnect();
    await User.create({
      email: 'test@test.com',
      password: 'password123',
      name: 'test name',
      surname: 'test surname',
      role: 'user',
      active: true,
    });
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'test@test.com',
        password: 'password123',
      })
      .expect(200);
    token = response.body.token;
    cart = await Cart.create({
      userId: response.body.data.user._id,
      products: [
        { productId: '647057399cd597cc0c2c727e', quantity: 2 },
        { productId: '647057399cd597cc0c2c7299', quantity: 4 },
        { productId: '647057379cd597cc0c2c6f36', quantity: 5 },
      ],
    });
  });
  afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
    await redisDisconnect();
  });

  describe('/:cartId route', () => {
    it('should return 404 as cartId is incorrect', (done) => {
      makeRequest({
        method: 'get',
        route: `carts/647057379cd597cc0c2c6f36`,
        statusCode: 404,
        done,
        token,
        expectedResult: 'There is no cart with such id',
      });
    });

    it('should return cart', (done) => {
      makeRequest({
        method: 'get',
        route: `carts/${cart._id}`,
        statusCode: 200,
        done,
        token,
        expectedResult: 'Cart was found',
      });
    });
  });

  describe('/:productId route for adding', () => {
    it('should add product to cart', (done) => {
      makeRequest({
        method: 'patch',
        route: 'products/647057399cd597cc0c2c737e/carts',
        statusCode: 201,
        body: {
          quantity: 2,
        },
        done,
        token,
        expectedResult: 'Product was successfully added to cart',
      });
    });
    it('should add product to cart which exists there', (done) => {
      makeRequest({
        method: 'patch',
        route: 'products/647057379cd597cc0c2c6f36/carts',
        statusCode: 201,
        body: {
          quantity: 1,
        },
        done,
        token,
        expectedResult: 'Product was successfully added to cart',
      });
    });
  });

  describe('/:productId route for deleting', () => {
    it("should return 400 as quantity can't be negative", (done) => {
      makeRequest({
        method: 'delete',
        route: 'products/647057399cd597cc0c2c7299/carts',
        statusCode: 400,
        body: { quantityToDelete: -1 },
        done,
        token,
        isContentTypePresent: false,
        expectedResult: [
          "Invalid value. Field 'quantityToDelete' with value '-1' doesn't pass validation. Please provide correct data",
        ],
      });
    });

    it('should return 404 as there is no such product', (done) => {
      makeRequest({
        method: 'delete',
        route: 'products/647057399cd597cc0c2c637e/carts',
        statusCode: 404,
        body: { quantityToDelete: 1 },
        done,
        token,
        isContentTypePresent: false,
        expectedResult: 'There is no such product in your cart',
      });
    });

    it('should delete product from cart', (done) => {
      makeRequest({
        method: 'delete',
        route: 'products/647057399cd597cc0c2c7299/carts',
        statusCode: 204,
        body: { quantityToDelete: 2 },
        done,
        token,
        isContentTypePresent: false,
      });
    });
  });

  describe('/:clear route for deleting', () => {
    it('should clear cart', (done) => {
      makeRequest({
        method: 'delete',
        route: 'carts/clear',
        statusCode: 204,
        done,
        token,
        isContentTypePresent: false,
      });
    });
  });
});
