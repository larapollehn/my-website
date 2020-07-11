const redis = require('redis');
const log = require("../log/Logger");

const redisAccess = redis.createClient(
    {
        host: process.env.REDIS_HOST || 'localhost',
        port: 6379
    }
);

log.debug("Using redis' client with following information", redisAccess);

module.exports = redisAccess;
