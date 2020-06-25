const redis = require('redis');
const log = require("../log/Logger");

const redis_client = redis.createClient(
    {
        host: process.env.REDIS_HOST || 'localhost',
        port: 6379
    }
);

log.debug("Using redis' client with following information", redis_client);
module.exports = redis_client;