const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

module.exports = (req, res, next) => {
  const { errors } = validationResult(req);
  if (errors.length) {
    const errorsArr = errors.map(
      (error) =>
        // eslint-disable-next-line implicit-arrow-linebreak
        `${error.msg}. Field '${error.path}' with value '${error.value}' doesn't pass validation. Please provide correct data`,
    );
    return next(new AppError(errorsArr, 400));
  }
  next();
};
