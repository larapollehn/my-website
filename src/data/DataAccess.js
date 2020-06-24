const Pool = require('pg').Pool;

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'website_messages',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: 5432
});

module.exports = pool;