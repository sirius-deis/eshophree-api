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
