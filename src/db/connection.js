const mongoose = require('mongoose');
const log = require('../utils/log');

const connect = () => {
  mongoose.connect(`mongodb://localhost:27017/${process.env.DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.set('debug', (collectionName, method, query, doc) => {
    log('info', 'magenta', 'database state', `${collectionName}.${method}`, JSON.stringify(query), doc);
  });

  mongoose.connection
    .on('open', () => log('info', 'green', 'database state', 'Connection established'))
    .on('close', () => log('info', 'green', 'database state', 'Connection close'))
    .on('error', (error) => log('error', 'red', 'database state', error));
};

module.exports = connect;
