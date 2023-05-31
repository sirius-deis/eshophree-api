// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./db');
const { redisConnect, redisDisconnect } = require('../db/redis.js');
const User = require('../models/user.models');
const app = require('../app');
const makeRequest = require('./makeRequest');

describe('/products', () => {
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
    });
    afterAll(async () => {
        await clearDatabase();
        await closeDatabase();
        await redisDisconnect();
    });
    describe('/categories route', () => {
        it('should return 200', done => {
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
        it('should return 200 but with message that there are no product lefy', done => {
            makeRequest({
                method: 'get',
                route: 'products/',
                statusCode: 200,
                done,
                expectedResult: 'There are no products left',
            });
        });
    });
});
