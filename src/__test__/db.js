const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-require
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = MongoMemoryServer.create();

exports.connect = async () => {
  const uri = await (await mongod).getUri();
  await mongoose.connect(uri);
};
exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await (await mongod).stop();
};
exports.clearDatabase = async () => {
  const { collections } = mongoose.connection;
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in collections) {
    const collection = collections[key];
    // eslint-disable-next-line no-await-in-loop
    await collection.deleteMany({});
  }
};
