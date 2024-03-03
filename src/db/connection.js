const mongoose = require("mongoose");
const logger = require("../api/logger");

const { DB_USERNAME, DB_PASSWORD } = process.env;

const connect = () => {
  mongoose.connect(
    `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@mycluster.ajlydsh.mongodb.net/?retryWrites=true&w=majority&appName=MyCluster`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  mongoose.set("debug", (collectionName, method, query, doc) => {
    logger.debug(
      `${collectionName}.${method}: ${JSON.stringify(query)}, ${doc}`
    );
  });

  mongoose.connection
    .on("open", () => logger.info("Connection established"))
    .on("close", () => logger.info("Connection close"))
    .on("error", logger.error.bind(logger));
};

module.exports = connect;
