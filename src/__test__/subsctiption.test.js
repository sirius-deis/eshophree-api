// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./db');
const { redisConnect, redisDisconnect } = require('../db/redis');
const User = require('../models/user.models');
const Subscription = require('../models/subscription.models');
const app = require('../app');
const makeRequest = require('./makeRequest');

describe('/discounts', () => {
  let token;
  let token2;
  beforeAll(async () => {
    await connect();
    await redisConnect();

    await User.create({
      email: 'test@test.com',
      password: 'password123',
      role: 'admin',
      active: true,
    });
    await User.create({
      email: 'test2@test.com',
      password: 'password123',
      role: 'user',
      active: true,
    });
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'test@test.com', password: 'password123' });
    token = response.body.token;
    const response2 = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'test2@test.com', password: 'password123' });
    token2 = response2.body.token;
  });

  afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
    await redisDisconnect();
  });
  describe('/ post route', () => {
    it('should return 400', (done) => {
      makeRequest({
        method: 'post',
        route: 'subscriptions',
        statusCode: 400,
        expectedResult: [
          "Invalid value. Field 'email' with value 'undefined' doesn't pass validation. Please provide correct data",
        ],
        done,
      });
    });
    it('should return 200', (done) => {
      makeRequest({
        method: 'post',
        route: 'subscriptions',
        body: { email: 'test@test.com' },
        statusCode: 200,
        expectedResult: 'You were subscribed on our news successfully',
        done,
      });
    });
  });
  describe('/:token delete route', () => {
    it('should return 400', (done) => {
      makeRequest({
        method: 'delete',
        route: 'subscriptions/hds73gs342',
        statusCode: 404,
        expectedResult: 'There is no such email',
        done,
      });
    });
    it('should return 204', (done) => {
      Subscription.findOne({ email: 'test@test.com' }).then((subscription) => {
        makeRequest({
          method: 'delete',
          route: `subscriptions/${subscription.tokenToUnsubscribe}`,
          statusCode: 204,
          isContentTypePresent: false,
          done,
        });
      });
    });
  });
  describe('/send delete route', () => {
    it('should return 401', (done) => {
      makeRequest({
        method: 'post',
        route: 'subscriptions/send',
        statusCode: 401,
        expectedResult: 'Sign in before trying to access this route',
        done,
      });
    });
    it('should return 403', (done) => {
      makeRequest({
        method: 'post',
        route: 'subscriptions/send',
        statusCode: 403,
        expectedResult: "You don't have access to this route",
        done,
        token: token2,
      });
    });
    it('should return 200', (done) => {
      makeRequest({
        method: 'post',
        route: 'subscriptions/send',
        statusCode: 200,
        expectedResult: 'Email was sent to all subscribers',
        done,
        token,
      });
    });
  });
});
