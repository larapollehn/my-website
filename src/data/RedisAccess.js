const redis = require('redis');

const redis_client = redis.createClient(
    {
        host: process.env.REDIS_HOST || 'localhost',
        port: 6379
    }
);

module.exports = redis_client;