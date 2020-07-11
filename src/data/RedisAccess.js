const redis = require('redis');
import log from "../log/Logger";

 export const redisAccess = redis.createClient(
    {
        host: process.env.REDIS_HOST || 'localhost',
        port: 6379
    }
);

log.debug("Using redis' client with following information", redis_client);
