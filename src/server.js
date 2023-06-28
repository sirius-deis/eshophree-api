require('dotenv').config();
const http = require('http');
const connect = require('./db/connection');
const app = require('./app');
const { redisConnect } = require('./db/redis');
const logger = require('./api/logger');

const { PORT = 3000 } = process.env;

const server = http.createServer(app);
require('./listeners/socket')(server);

const start = () => {
  try {
    connect();
    redisConnect();
    server.listen(PORT, () => {
      logger.info(`Server is running on port: ${PORT}`);
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

[('unhandledRejection', 'uncaughtException')].forEach((event) => {
  // const index = event.search(/[A-Z]/);
  process.on(event, (error) => {
    logger.error(error);
    server.close(() => {
      process.exit(1);
    });
  });
});

['SIGTERM', 'SIGINT', 'SIGQUIT'].forEach((event) => {
  process.on(event, () => {
    logger.info(`${event} received`);
    server.close(() => {
      logger.info('Process terminated');
      process.exit(1);
    });
  });
});

start();
