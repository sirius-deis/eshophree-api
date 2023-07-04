const crypto = require('crypto');

exports.addToMapIfValuesExist = (values) => {
  const map = {};
  let isAdded = false;
  // eslint-disable-next-line no-restricted-syntax
  for (const key in values) {
    if (values[key]) {
      map[key] = values[key];
      isAdded = true;
    }
  }
  return isAdded && map;
};

exports.createToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  return resetToken;
};

exports.findOption = (options, optionNameId, optionId) =>
  options
    .find((optionName) => optionName._id.equals(optionNameId))
    ?.optArr.find((option) => option._id.equals(optionId));
