const mongoose = require('mongoose');
const logger = require('../api/logger');

const connect = () => {
  mongoose.connect(`mongodb://localhost:27017/${process.env.DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.set('debug', (collectionName, method, query, doc) => {
    logger.debug(`${collectionName}.${method}: ${JSON.stringify(query)}, ${doc}`);
  });

  mongoose.connection
    .on('open', () => logger.info('Connection established'))
    .on('close', () => logger.info('Connection close'))
    .on('error', logger.error);
};

module.exports = connect;
