const express = require('express');
const router = express.Router();
const pool = require('../db'); // Asegúrate de importar la configuración de tu conexión

// Obtener todos los bancos
router.get('/bancos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM bancos order by codigo_banco asc');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Buscar id del banco por codigo:
router.get('/buscar_banco', async (req, res) => {
    try {
        const { codigo } = req.query;  // Extrae 'codigo' desde la consulta de la URL
        const result = await pool.query('SELECT id FROM bancos WHERE codigo_banco = $1 ORDER BY id DESC LIMIT 1', [codigo]);
        res.json(result.rows[0]);
        //res.json(result.rows);  // Esta línea está comentada (opcional)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Obtener un token
router.get('/buscar_token', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tokens WHERE used = false ORDER BY id DESC LIMIT 1');
        res.json(result.rows[0]);
        //res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Actualizar campo used de un token
router.put('/:id', async (req, res) => {
    try {
        const { used } = req.body; // Obtenemos el valor de "used" del cuerpo de la solicitud
        const result = await pool.query(
            'UPDATE tokens SET used = $1 WHERE id = $2 RETURNING *',
            [used, req.params.id]
        );

        if (result.rows.length === 0) return res.status(404).send('Token no encontrado');

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Buscar cliente:
router.get('/buscar_cliente', async (req, res) => {
    try {
        const { cedula } = req.query;  // Extrae 'cedula' desde la consulta de la URL
        const result = await pool.query('SELECT id FROM clientes WHERE cedula = $1 ORDER BY id DESC LIMIT 1', [cedula]);
        res.json(result.rows[0]);
        //res.json(result.rows);  // Esta línea está comentada (opcional)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Crear un nuevo cliente
router.post('/crear_cliente', async (req, res) => {
    try {
        const { cedula } = req.body;
        const result = await pool.query('INSERT INTO clientes (cedula) VALUES ($1) RETURNING *', [cedula]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Insertar en cliente_tokens
router.post('/cliente_tokens', async (req, res) => {
    try {
        const { cliente_id, token_id } = req.body;
        const result = await pool.query(
            'INSERT INTO public.cliente_tokens (cliente_id, token_id, fecha_creacion) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
            [cliente_id, token_id]
        );
        res.status(201).json(result.rows[0]);  // Devuelve el registro insertado
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Insertar datos en la tabla transac
router.post('/crear_transac', async (req, res) => {
    try {
        const { cliente_token_id, telefono, banco_id, monto, referencia, descripcion } = req.body;  // Captura los datos desde el cuerpo de la petición
        const result = await pool.query(
            'INSERT INTO public.transac (cliente_token_id, telefono, banco_id, monto, referencia, descripcion, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *',
            [cliente_token_id, telefono, banco_id, monto, referencia, descripcion]
        );
        res.status(201).json(result.rows[0]);  // Devuelve el registro insertado
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;
