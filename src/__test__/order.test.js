// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./db');
const { redisConnect, redisDisconnect } = require('../db/redis');
const User = require('../models/user.models');
const Product = require('../models/product.models');
const Cart = require('../models/cart.models');
const OrderDetail = require('../models/orderDetail.models');
const app = require('../app');
const makeRequest = require('./makeRequest');

describe('/orders', () => {
  let user;
  let token;
  let product1;
  let product2;
  let testCart;
  beforeAll(async () => {
    await connect();
    await redisConnect();
    const options = [
      {
        title: 'Option 1',
        optArr: [
          {
            opt: 'Opt1',
            plusToPrice: 203,
          },
          {
            opt: 'Opt2',
            plusToPrice: 102,
          },
        ],
      },
    ];
    product1 = await Product.create({
      _id: '64777d65c584ff381b29ee4e',
      name: 'product 1',
      categoryId: '64777772368a9a9f9c105b17',
      price: 106,
      brandId: '6470509a84eda2141def7aff',
      images: [''],
      ratingAverage: 5,
      options,
      colors: ['black'],
    });
    product2 = await Product.create({
      _id: '64777d68c584ff381b29f87f',
      name: 'product 2',
      categoryId: '64777772368a9a9f9c105b17',
      price: 23,
      brandId: '6470509a84eda2141def7aff',
      images: [''],
      ratingAverage: 4,
      options,
      colors: ['black'],
    });
    testCart = {
      products: [
        {
          productId: product1._id,
          quantity: 2,
          color: 'black',
          optionNameId: product1.options[0]._id,
          optionId: product1.options[0].optArr[0]._id,
        },
        {
          productId: product2._id,
          quantity: 4,
          color: 'black',
          optionNameId: product2.options[0]._id,
          optionId: product2.options[0].optArr[0]._id,
        },
        {
          productId: product1._id,
          quantity: 5,
          color: 'black',
          optionNameId: product1.options[0]._id,
          optionId: product1.options[0].optArr[1]._id,
        },
      ],
    };

    user = await User.create({
      email: 'test@test.com',
      password: 'password123',
      role: 'user',
      active: true,
    });

    await Cart.create({
      userId: user._id,
      products: [
        {
          productId: product1._id,
          quantity: 2,
          color: 'black',
          optionNameId: product1.options[0]._id,
          optionId: product1.options[0].optArr[0]._id,
        },
        {
          productId: product2._id,
          quantity: 4,
          color: 'black',
          optionNameId: product2.options[0]._id,
          optionId: product2.options[0].optArr[0]._id,
        },
        {
          productId: product1._id,
          quantity: 5,
          color: 'black',
          optionNameId: product1.options[0]._id,
          optionId: product1.options[0].optArr[1]._id,
        },
      ],
    });
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'test@test.com', password: 'password123' });
    // eslint-disable-next-line prefer-destructuring
    token = response.body.token;
  });

  afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
    await redisDisconnect();
  });
  describe('/ route for adding order', () => {
    it('should return 400 as cart is empty', (done) => {
      makeRequest({
        method: 'post',
        route: 'orders/',
        statusCode: 400,
        expectedResult: "Cart can't be empty",
        done,
      });
    });
    it('should return 400 as cart is empty', (done) => {
      makeRequest({
        method: 'post',
        route: 'orders/',
        body: {
          cart: {},
          email: 'test@test,com',
        },
        statusCode: 400,
        expectedResult: "Cart can't be empty",
        done,
      });
    });
    it('should return 400 as there is neither user nor email provided', (done) => {
      makeRequest({
        method: 'post',
        route: 'orders/',
        body: {
          cart: testCart,
        },
        statusCode: 400,
        expectedResult: 'Please provide email or create an account',
        done,
      });
    });
    it('should return 201 with provided email', (done) => {
      makeRequest({
        method: 'post',
        route: 'orders/',
        body: {
          email: 'test@test.com',
          comment: 'some comment',
          cart: testCart,
        },
        statusCode: 201,
        expectedResult: 'Products from cart were added to order successfully',
        done,
      });
    });
    it('should return 201 with logged in user', (done) => {
      makeRequest({
        method: 'post',
        route: 'orders/',
        body: {
          comment: 'some comment',
        },
        statusCode: 201,
        expectedResult: 'Products from cart were added to order successfully',
        done,
        token,
      });
    });
  });
  describe('/ get route for getting info about order', () => {
    it('should return 404', (done) => {
      makeRequest({
        method: 'get',
        route: 'orders/647bf022a8d26afbbcf38af0',
        statusCode: 404,
        expectedResult: 'There is no such order. Please check if order id is correct',
        done,
      });
    });
    it('should return 400 as there is nor neither email nor user', (done) => {
      OrderDetail.findOne({ email: 'test@test.com' }).then((order) => {
        makeRequest({
          method: 'get',
          route: `orders/${order._id}`,
          statusCode: 400,
          expectedResult: 'Please provide email or create an account',
          done,
        });
      });
    });
    it('should return 401', (done) => {
      OrderDetail.findOne({ email: 'test@test.com' }).then((order) => {
        makeRequest({
          method: 'get',
          route: `orders/${order._id}`,
          body: {
            email: 'test2@test.com',
          },
          statusCode: 401,
          expectedResult: "This order is not your. You cant't get information about this order",
          done,
        });
      });
    });
    it('should return 200 with provided email', (done) => {
      OrderDetail.findOne({ email: 'test@test.com' }).then((order) => {
        makeRequest({
          method: 'get',
          route: `orders/${order._id}`,
          body: {
            email: 'test@test.com',
          },
          statusCode: 200,
          expectedResult: 'Order was found',
          done,
        });
      });
    });
    it('should return 200 with logged in user', (done) => {
      OrderDetail.findOne({ userId: user._id }).then((order) => {
        makeRequest({
          method: 'get',
          route: `orders/${order._id}`,
          statusCode: 200,
          expectedResult: 'Order was found',
          done,
          token,
        });
      });
    });
  });
  describe('/ patch route for updating comment', () => {
    it('should return 400 as there is neither email nor user', (done) => {
      OrderDetail.findOne({ email: 'test@test.com' }).then((order) => {
        makeRequest({
          method: 'patch',
          route: `orders/${order._id}`,
          body: {
            comment: 'Some comment',
          },
          statusCode: 400,
          expectedResult: 'Please provide email or create an account',
          done,
        });
      });
    });
    it("should return 401 as client doesn't have access to this account", (done) => {
      OrderDetail.findOne({ email: 'test@test.com' }).then((order) => {
        makeRequest({
          method: 'patch',
          route: `orders/${order._id}`,
          body: {
            comment: 'Some comment',
            email: 'test2@test.com',
          },
          statusCode: 401,
          expectedResult: "This order is not your. You cant't update this order",
          done,
        });
      });
    });
    it('should return 404 as there is no such order', (done) => {
      makeRequest({
        method: 'patch',
        route: 'orders/647befa6575f4e4c7141097f',
        body: {
          comment: 'Some comment',
          email: 'test2@test.com',
        },
        statusCode: 404,
        expectedResult: 'There is no such order. Please check if order id is correct',
        done,
      });
    });
    it('should return 200 with email', (done) => {
      OrderDetail.findOne({ email: 'test@test.com' }).then((order) => {
        makeRequest({
          method: 'patch',
          route: `orders/${order._id}`,
          body: {
            comment: 'Some comment',
            email: 'test@test.com',
          },
          statusCode: 200,
          expectedResult: 'Order comment was successfully updated',
          done,
        });
      });
    });
    it('should return 200 with logged in user', (done) => {
      OrderDetail.findOne({ userId: user._id }).then((order) => {
        makeRequest({
          method: 'patch',
          route: `orders/${order._id}`,
          body: {
            comment: 'Some comment',
          },
          statusCode: 200,
          expectedResult: 'Order comment was successfully updated',
          done,
          token,
        });
      });
    });
  });
  describe('/ delete route for discarding the order', () => {
    it('should return 400 as there is neither email nor user', (done) => {
      OrderDetail.findOne({ email: 'test@test.com' }).then((order) => {
        makeRequest({
          method: 'delete',
          route: `orders/${order._id}`,
          statusCode: 400,
          expectedResult: 'Please provide email or create an account',
          done,
        });
      });
    });
    it("should return 401 as client doesn't have access to this account", (done) => {
      OrderDetail.findOne({ email: 'test@test.com' }).then((order) => {
        makeRequest({
          method: 'delete',
          route: `orders/${order._id}`,
          body: {
            email: 'test2@test.com',
          },
          statusCode: 401,
          expectedResult: "This order is not your. You cant't update this order",
          done,
        });
      });
    });
    it('should return 404 as there is no such order', (done) => {
      makeRequest({
        method: 'delete',
        route: 'orders/647befa6575f4e4c7141097f',
        body: {
          email: 'test2@test.com',
        },
        statusCode: 404,
        expectedResult: 'There is no such order. Please check if order id is correct',
        done,
      });
    });
    it('should return 200 with email', (done) => {
      OrderDetail.findOne({ email: 'test@test.com' }).then((order) => {
        makeRequest({
          method: 'delete',
          route: `orders/${order._id}`,
          body: {
            email: 'test@test.com',
          },
          statusCode: 204,
          isContentTypePresent: false,
          done,
        });
      });
    });
    it('should return 204 with logged in user', (done) => {
      OrderDetail.findOne({ userId: user._id }).then((order) => {
        makeRequest({
          method: 'delete',
          route: `orders/${order._id}`,
          statusCode: 204,
          isContentTypePresent: false,
          done,
          token,
        });
      });
    });
  });
});
