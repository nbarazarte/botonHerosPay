const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;
const usuariosRouter = require('./routes/routes.js');

// Habilitar CORS para todas las solicitudes 
app.use(cors());

app.use(express.json());
app.use('/CreditoInmediato', usuariosRouter);

app.get('/', (req, res) => {
  res.send('¡API, MiBanco!');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});