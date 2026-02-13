const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

// Only log once when connected
let connectionLogged = false;
pool.on('connect', () => {
    if (!connectionLogged) {
        console.log('Connected to the PostgreSQL database');
        connectionLogged = true;
    }
});

module.exports = pool;
