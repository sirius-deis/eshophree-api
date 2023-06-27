const { body, param, query } = require('express-validator');

exports.isEmail = (isOptional = false) => body('email').optional(isOptional).isEmail().escape();

exports.isNthLength = ({ field, isOptional = false, min = 4, max }) =>
  body(field).optional(isOptional).trim().isLength({ min, max }).escape();

exports.isPrice = ({ field }) => body(field).isCurrency().escape();

exports.isIntWithMin = ({ field, isOptional = false, min = 0, max }) =>
  body(field).optional(isOptional).isInt({ min, max });

exports.isMongoId = ({ field }) => param(field).isMongoId();
exports.isMongoIdInBody = ({ field }) => body(field).isMongoId();

exports.isGreaterThan = ({ field, isOptional = false, gt }) =>
  query(field).optional(isOptional).isInt({ gt });

exports.isArray = ({ field, isOptional }) => body(field).optional(isOptional).isArray();
