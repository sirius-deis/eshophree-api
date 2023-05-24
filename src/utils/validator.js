const { body, param } = require('express-validator');

exports.isEmail = () => body('email').isEmail().escape();

exports.isNthLength = (field, min = 4, max) =>
    body(field).trim().isLength({ min, max }).escape();

exports.isPrice = field => body(field).isCurrency().escape();

exports.isIntWithMin = (field, min) => body(field).isInt({ min });

exports.isMongoId = field => param(field).isMongoId();
