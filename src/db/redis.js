const { createClient } = require("redis");
const logger = require("../api/logger");

const client = createClient();

client.on("connect", () => logger.info("Redis client connected"));
client.on("error", logger.error.bind(logger));

const redisConnect = async () => {
  await client.connect();
};

const redisDisconnect = async () => {
  await client.disconnect();
};

const getValue = async (key, value) =>
  JSON.parse(await client.get(`${key}:${value}`));

const setValue = async (key, value, options) => {
  await client.set(
    `${key}:${value}`,
    JSON.stringify(value),
    parseInt(options, 10)
  );
};

module.exports = {
  redisConnect,
  redisDisconnect,
  client,
  getValue,
  setValue,
};
