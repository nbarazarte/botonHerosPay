const dotenv = require('dotenv');

// Asegúrate de especificar la ruta correcta si tu archivo .env no está en el directorio raíz
dotenv.config({ path: '../.env' });
const axios = require('axios');
const CryptoJS = require('crypto-js');
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
/* router.get('/buscar_token', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tokens WHERE used = false ORDER BY id DESC LIMIT 1');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
}); */

router.get('/buscar_token', async (req, res) => {
    try {
        const { plan } = req.query;
        const result = await pool.query('SELECT * FROM tokens WHERE used = false and plan = $1 ORDER BY id DESC LIMIT 1', [plan]);
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

// Buscar en cliente_tokens
router.get('/cliente_tokens', async (req, res) => {
    try {
        const { id } = req.query;
        const result = await pool.query('SELECT tr.cliente_token_id as id FROM public.tokens as t join cliente_tokens as ct on ct.token_id = t.id join transac as tr on tr.cliente_token_id = ct.id where tr.id = $1', [id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Insertar en transac
router.post('/crear_transac', async (req, res) => {
    try {
        const { cliente_token_id, telefono, banco_id, monto, referencia, descripcion, pasarela_id, sitio_id, sistema_operativo, id_transc } = req.body;
        const result = await pool.query(
            'INSERT INTO public.transac (cliente_token_id, telefono, banco_id, monto, referencia, descripcion, pasarela_id, sitio_id, sistema_operativo, id_transc, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP) RETURNING *',
            [cliente_token_id, telefono, banco_id, monto, referencia, descripcion, pasarela_id, sitio_id, sistema_operativo, id_transc]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Buscar transacciones
router.get('/buscar_transacciones', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.view_transacciones order by fecha_creacion desc');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Buscar transacciones por id
router.get('/buscar_transacciones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM public.view_transacciones WHERE id = $1 ORDER BY fecha_creacion DESC', [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Buscar logs
router.get('/buscar_logs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.view_logs order by hora desc');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Endpoint para consultar los logs de errores
router.get('/error-logs', async (req, res) => {
    try {
        const { hora } = req.query;
        const result = await pool.query('SELECT * FROM error_logs WHERE hora = $1 ORDER BY timestamp DESC', [hora]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los logs de errores');
    }
});

// Endpoint para guardar los logs de errores
router.post('/error-logs', async (req, res) => {
    const { error_code, error_message, error_name, url, api, hora } = req.body;

    try {
        await pool.query(
            'INSERT INTO error_logs (error_code, error_message, error_name, url, api, hora) VALUES ($1, $2, $3, $4, $5, $6)',
            [error_code, error_message, error_name, url, api, hora]
        );
        res.status(201).send('Error log guardado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error guardando log');
    }
});

// ########################## PARA R4 ################################

router.post('/MBconsulta', async (req, res) => {
    try {
        const { IdCliente, Monto, TelefonoComercio } = req.body;

        // Validación de campos requeridos
        if (!IdCliente) return res.status(400).send('IdCliente es requerido');
        if (!Monto) return res.status(400).send('Monto es requerido');
        if (!TelefonoComercio) return res.status(400).send('TelefonoComercio es requerido');

        // Consulta en la tabla clientes
        const result = await pool.query('SELECT * FROM clientes WHERE cedula = $1 ORDER BY id DESC LIMIT 1', [`V${IdCliente}`]);
        if (result.rows.length === 0) return res.json({ status: false });

        // Consulta en la tabla montos
        const montosResult = await pool.query(`SELECT monto FROM public.montos WHERE tipo = 'pago movil'`);
        if (montosResult.rows[0].monto !== Monto || TelefonoComercio !== process.env.TELEFONOCOMERCIO) {
            return res.json({ status: false });
        }

        res.json({ status: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

router.post('/MBnotifica', async (req, res) => {
    try {
        const { IdComercio, TelefonoComercio, TelefonoEmisor, Concepto, BancoEmisor, Monto, FechaHora, Referencia, CodigoRed } = req.body;

        // Validación de campos requeridos
        if (!IdComercio || !TelefonoComercio || !TelefonoEmisor || !BancoEmisor || !Monto || !FechaHora || !Referencia || !CodigoRed) {
            return res.status(400).send('Todos los campos requeridos deben ser proporcionados');
        }

        const tokenCommerce = process.env.TOKEN_COMMERCE;
        const dataToHash = Referencia + TelefonoEmisor;
        const hash = CryptoJS.HmacSHA256(dataToHash, tokenCommerce);
        const hmac = hash.toString(CryptoJS.enc.Hex);

        const headersMiBanco = {
            'Content-Type': 'application/json',
            'Authorization': `${hmac}`,
            'Commerce': `${tokenCommerce}`
        };

        // Realizar petición a la URL proporcionada
        const response = await axios.post('https://r4conecta.mibanco.com.ve/MBconsulta_pm', {
            referencia: Referencia,
            telefono_origen: TelefonoEmisor
        }, { headers: headersMiBanco });

        const { code, message } = response.data;

        // Manejar la respuesta de la petición
        if (code === "00") {
            res.json({ abono: true, mensaje: message });
        } else {
            res.json({ abono: false, mensaje: message });
        }

    } catch (err) {
        console.error('Error en el servidor:', err.message);
        res.status(500).send('Error en el servidor');
    }
});

/* router.get('/MBconsulta', async (req, res) => {
    try {
        const { idCliente, Monto, TelefonoComercio } = req.query;
        //console.log({ idCliente, Monto, TelefonoComercio });

        if (!idCliente) {
            return res.status(400).send('idCliente es requerido');
        }

        if (!Monto) {
            return res.status(400).send('Monto es requerido');
        }

        if (!TelefonoComercio) {
            return res.status(400).send('TelefonoComercio es requerido');
        }

        const result = await pool.query('SELECT * FROM clientes WHERE cedula = $1 ORDER BY id DESC LIMIT 1', [`V${idCliente}`]);//nota

        if (result.rows.length === 0) {
            res.json({ status: false });
        } else {
            try {
                const montosResult = await pool.query(`SELECT monto FROM public.montos where tipo = 'pago movil'`);

                if (montosResult.rows[0].monto === Monto) {

                    //console.log(process.env.TELEFONOCOMERCIO);

                    if (TelefonoComercio === process.env.TELEFONOCOMERCIO) {
                        //res.json({ status: true, cliente: result.rows[0], montos: montosResult.rows });
                        res.json({ status: true });
                    } else {
                        res.json({ status: false });
                    }

                } else {
                    res.json({ status: false });
                }

            } catch (err) {
                console.error(err.message);
                return res.status(500).send('Error en el servidor al obtener los montos');
            }
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

router.post('/MBconsulta', async (req, res) => {
    try {
        const { IdCliente, Monto, TelefonoComercio } = req.body;

        // Validación de campos requeridos
        if (!IdCliente || !Monto || !TelefonoComercio) {
            return res.status(400).send('Todos los campos requeridos deben ser proporcionados');
        }

        // Inserción en la tabla MBconsulta
        const result = await pool.query(`
            INSERT INTO R4Consulta (IdCliente, Monto, TelefonoComercio)
            VALUES ($1, $2, $3) RETURNING *
        `, [IdCliente, Monto, TelefonoComercio]);

        if (result.rowCount > 0) {
            res.json({ status: true });
        } else {
            res.json({ status: false });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

router.post('/MBnotifica', async (req, res) => {
    try {
        const { IdComercio, TelefonoComercio, TelefonoEmisor, Concepto, BancoEmisor, Monto, FechaHora, Referencia, CodigoRed } = req.body;

        // Validación de campos requeridos
        if (!IdComercio || !TelefonoComercio || !TelefonoEmisor || !BancoEmisor || !Monto || !FechaHora || !Referencia || !CodigoRed) {
            return res.status(400).send('Todos los campos requeridos deben ser proporcionados');
        }

        // Inserción en la tabla R4Notifica
        const result = await pool.query(`
            INSERT INTO R4Notifica (IdComercio, TelefonoComercio, TelefonoEmisor, Concepto, BancoEmisor, Monto, FechaHora, Referencia, CodigoRed)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `, [IdComercio, TelefonoComercio, TelefonoEmisor, Concepto, BancoEmisor, Monto, FechaHora, Referencia, CodigoRed]);

        if (result.rowCount > 0) {
            res.json({ abono: true });
        } else {
            res.json({ abono: false });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
}); */

module.exports = router;
