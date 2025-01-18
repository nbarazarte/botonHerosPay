const express = require('express');
const router = express.Router();
const pool = require('../db'); // Asegúrate de importar la configuración de tu conexión


// Obtener todos los bancos
router.get('/bancos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM banco');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Obtener todos los tokens
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tokens where used = false');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Obtener un token por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tokens WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).send('Token no encontrado');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Crear un nuevo token
router.post('/', async (req, res) => {
    try {
        const { token } = req.body;
        const result = await pool.query('INSERT INTO tokens (token) VALUES ($1) RETURNING *', [token]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Actualizar un token
router.put('/:id', async (req, res) => {
    try {
        const { token } = req.body;
        const result = await pool.query('UPDATE tokens SET token = $1 WHERE id = $2 RETURNING *', [token, req.params.id]);
        if (result.rows.length === 0) return res.status(404).send('Token no encontrado');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Eliminar un token
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM tokens WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).send('Token no encontrado');
        res.status(204).send();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;
