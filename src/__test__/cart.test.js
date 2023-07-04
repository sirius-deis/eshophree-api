// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./db');
const { redisConnect, redisDisconnect } = require('../db/redis');
const User = require('../models/user.models');
const Cart = require('../models/cart.models');
const Product = require('../models/product.models');
const app = require('../app');
const makeRequest = require('./makeRequest');

describe('/carts', () => {
  let token = '';
  let cart;
  let product1;
  let product3;

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
    // eslint-disable-next-line prefer-destructuring
    token = response.body.token;
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
      name: 'Product 1',
      categoryId: '647057399cd597cc0c2c727e',
      price: 500,
      brandId: '647057399cd597cc0c2c727e',
      images: [''],
      ratingAverage: 5,
      options,
      colors: ['black'],
    });
    const product2 = await Product.create({
      name: 'Product 2',
      categoryId: '647057399cd597cc0c2c727e',
      price: 700,
      brandId: '647057399cd597cc0c2c727e',
      images: [''],
      ratingAverage: 4,
      options,
      colors: ['black'],
    });
    product3 = await Product.create({
      name: 'Product 3',
      categoryId: '647057399cd597cc0c2c727e',
      price: 300,
      brandId: '647057399cd597cc0c2c727e',
      images: [''],
      ratingAverage: 2,
      options,
      colors: ['black'],
    });
    cart = await Cart.create({
      userId: response.body.data.user._id,
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
        route: `products/${product3._id}/carts`,
        statusCode: 201,
        body: {
          quantity: 2,
          color: 'black',
          optionNameId: product3.options[0]._id,
          optionId: product3.options[0].optArr[1]._id,
        },
        done,
        token,
        expectedResult: 'Product was successfully added to cart',
      });
    });
    it('should add product to cart which exists there', (done) => {
      makeRequest({
        method: 'patch',
        route: `products/${product1._id}/carts`,
        statusCode: 201,
        body: {
          quantity: 1,
          color: 'black',
          optionNameId: product1.options[0]._id,
          optionId: product1.options[0].optArr[1]._id,
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
        body: { quantityToDelete: -2 },
        done,
        token,
        isContentTypePresent: false,
        expectedResult: "Quantity can't be a negative value",
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
        route: `products/${product1._id}/carts`,
        statusCode: 204,
        body: {
          quantityToDelete: 2,
          color: 'black',
          optionNameId: product1.options[0]._id,
          optionId: product1.options[0].optArr[1]._id,
        },
        done,
        token,
        isContentTypePresent: false,
      });
    });
  });

  describe('/:clear route for clearing a cart', () => {
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
