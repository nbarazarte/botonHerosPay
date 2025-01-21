// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const usuariosRouter = require('./routes/routes.js'); // ubica la ruta correcta

const port = process.env.PORT || 3000; // Usa la variable de entorno PORT si está configurada

app.use(cors());
app.use(express.json());
app.use('/heros', usuariosRouter); // Ajuste de rutas

app.get('/', (req, res) => {
    res.send('API, HEROS TECHNOLOGY!');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
