// eslint-disable-next-line import/no-extraneous-dependencies, node/no-extraneous-require
const { defaults } = require('jest-config');

module.exports = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'js', 'mjs'],
  modulePathIgnorePatterns: ['./src/__tests__/db.js', './src/__tests__/makeRequest.js'],
  watchPathIgnorePatterns: ['./src/__tests__/db.js', './src/__tests__/makeRequest.js'],
  testPathIgnorePatterns: ['./src/__tests__/db.js', './src/__tests__/makeRequest.js'],
  coveragePathIgnorePatterns: ['./src/__tests__/db.js', './src/__tests__/makeRequest.js'],
  setupFiles: ['dotenv/config'],
};
