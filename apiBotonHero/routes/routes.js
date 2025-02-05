const express = require('express');
const router = express.Router();
const pool = require('../db');
const autenticarToken = require('../middlewares/autenticarToken'); // Asegúrate de que no use desestructuración
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Uso del middleware para proteger todas las rutas
router.use(autenticarToken);

// Registro de nuevo usuario
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query('INSERT INTO usuarios (username, password, email) VALUES ($1, $2, $3) RETURNING *', [username, hashedPassword, email]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(404).send('Usuario no encontrado');

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).send('Contraseña incorrecta');

        const token = jwt.sign({ id: user.id, username: user.username }, 'secret', { expiresIn: '1h' });
        await pool.query('INSERT INTO auth_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)', [user.id, token, new Date(Date.now() + 3600000)]);
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Buscar id del ap por identificador
router.get('/sitios', async (req, res) => {
    try {
        const { idAp } = req.query;
        const result = await pool.query('SELECT * FROM public.sitios where identificador = $1 ORDER BY id DESC LIMIT 1', [idAp]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Obtener monto los debito inmediato
router.get('/debitoinmediato', async (req, res) => {
    try {
        const result = await pool.query(`SELECT monto FROM public.montos where tipo = 'debito inmediato'`);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Obtener monto los credito inmediato
router.get('/creditoinmediato', async (req, res) => {
    try {
        const result = await pool.query(`SELECT monto FROM public.montos where tipo = 'credito inmediato'`);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Obtener todos los bancos
router.get('/bancos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM bancos ORDER BY codigo_banco asc');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Obtener todos los bancos que usan solo debito inmediato
router.get('/bancosDebitoInmediato', async (req, res) => {
    try {
        const result = await pool.query(`select * from public.bancos where tipo = 'debito inmediato' ORDER BY codigo_banco asc`);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Buscar id del banco por código
router.get('/buscar_banco', async (req, res) => {
    try {
        const { codigo } = req.query;
        const result = await pool.query('SELECT * FROM bancos WHERE codigo_banco = $1 ORDER BY id DESC LIMIT 1', [codigo]);
        res.json(result.rows[0]);
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
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Actualizar campo used y la fecha de creación de un token
router.put('/:id', async (req, res) => {
    try {
        const { used } = req.body;

        const result = await pool.query(
            'UPDATE tokens SET used = $1, fecha_creacion = NOW() WHERE id = $2 RETURNING *',
            [used, req.params.id]
        );

        if (result.rows.length === 0) return res.status(404).send('Token no encontrado');

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Buscar cliente
router.get('/buscar_cliente', async (req, res) => {
    try {
        const { cedula } = req.query;
        const result = await pool.query('SELECT id FROM clientes WHERE cedula = $1 ORDER BY id DESC LIMIT 1', [cedula]);
        res.json(result.rows[0]);
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
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Insertar en transac
router.post('/crear_transac', async (req, res) => {
    try {
        const { cliente_token_id, telefono, banco_id, monto, referencia, descripcion, pasarela_id, sitio_id } = req.body;
        const result = await pool.query(
            'INSERT INTO public.transac (cliente_token_id, telefono, banco_id, monto, referencia, descripcion, pasarela_id, sitio_id, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *',
            [cliente_token_id, telefono, banco_id, monto, referencia, descripcion, pasarela_id, sitio_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Buscar transaacciones un token
router.get('/buscar_transacciones', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.view_transacciones order by fecha_creacion desc');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;
