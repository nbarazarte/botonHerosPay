const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',           // Tu usuario
    host: 'localhost',          // El host donde se encuentra tu base de datos
    database: 'herostokendb',   // Nombre de tu base de datos
    password: 'H3r05*!',        // Tu contraseña
    port: 5432,                 // Puerto de PostgreSQL (por defecto 5432)
});

module.exports = pool;