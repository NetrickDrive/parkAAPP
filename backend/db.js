const { Pool } = require('pg');

const pool = new Pool({
    user: 'parkuser',
    host: 'localhost',
    database: 'parkapp',
    password: 'parkpass',
    port: 5432,
});

module.exports = pool;
