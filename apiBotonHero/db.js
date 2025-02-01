const dotenv = require('dotenv');

// Asegúrate de especificar la ruta correcta si tu archivo .env no está en el directorio raíz
dotenv.config({ path: './.env' });

const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DBUSER,
    host: process.env.DBHOST,
    database: process.env.DBDATABASE,
    password: process.env.DBPASSWORD,
    port: process.env.DBPORT,
});

module.exports = pool;