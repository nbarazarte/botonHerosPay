// server.js
//require('dotenv').config();
process.loadEnvFile('./.env'); //si no le pasas nada lee el .env por defecto
const express = require('express');
const cors = require('cors');
const app = express();
const usuariosRouter = require('./routes/routes.js'); // ubica la ruta correcta

const port = process.env.PORT || 3000; // Usa la variable de entorno PORT si está configurada


const { styleText } = require('node:util');

app.use(cors());
app.use(express.json());
app.use('/heros', usuariosRouter); // Ajuste de rutas

app.get('/', (req, res) => {
    res.send('API, HEROS TECHNOLOGY!');
});

app.listen(port, () => {
    console.log(
        styleText(
            'blue',
            styleText(
                'bold',
                styleText(
                    'underline', `Servidor escuchando en http://localhost:${port}`))
        )
    );
});
