const { body, param, query } = require('express-validator');

exports.isEmail = () => body('email').isEmail().escape();

exports.isNthLength = (field, min = 4, max) =>
    body(field).trim().isLength({ min, max }).escape();

exports.isPrice = field => body(field).isCurrency().escape();

exports.isIntWithMin = (field, isOptional = false, min = 0, max) =>
    body(field).optional(isOptional).isInt({ min, max });

exports.isMongoId = field => param(field).isMongoId();
exports.isMongoIdInBody = field => body(field).isMongoId();

exports.isGreaterThan = (field, isOptional, gt) =>
    query(field).optional(isOptional).isInt({ gt });
