const express = require('express');
const { addOrder } = require('../controllers/order.controllers');

const orderRouter = express.Router();

orderRouter.post('/', addOrder);

module.exports = orderRouter;
