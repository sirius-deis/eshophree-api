const { createClient } = require('redis');

const log = require('../utils/log');

let client = createClient();
client.on('connect', () =>
    log('info', 'green', 'redis status', 'Redis client connected')
);
client.on('error', error => log('error', 'red', 'redis status', error));

const redisConnect = async () => {
    await client.connect();
};

const redisDisconnect = async () => {
    await client.disconnect();
};

const getValue = async (key, value) => {
    return JSON.parse(await client.get(`${key}:${value}`));
};

const setValue = async (key, value, options) => {
    await client.set(
        `${key}:${value}`,
        JSON.stringify(value),
        parseInt(options)
    );
};

module.exports = {
    redisConnect,
    redisDisconnect,
    client,
    getValue,
    setValue,
};
