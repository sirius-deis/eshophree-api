// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./db');
const { redisConnect, redisDisconnect } = require('../db/redis.js');
const User = require('../models/user.models');
const app = require('../app');
const makeRequest = require('./makeRequest');

describe('/products', () => {});
