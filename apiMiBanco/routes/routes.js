const express = require('express');
const router = express.Router();

let tokens = [];

// Crear un nuevo token
router.post('/', (req, res) => {

  ///...... procesos del banco.....

  const nuevotoken = {
    code: "ACCP",
    message: "Operación Aceptada",
    reference: "87882878",
    id: tokens.length + 1,
  };
  tokens.push(nuevotoken);
  res.status(201).json(nuevotoken);
});

module.exports = router;
