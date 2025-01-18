const express = require('express');
const router = express.Router();

let tokens = [
    { id: 1, token: 'abcd' },
    { id: 2, token: 'efgh' },
];

// Obtener todos los tokens
router.get('/', (req, res) => {
    res.json(tokens);
});

// Obtener un token por ID
router.get('/:id', (req, res) => {
    const token = tokens.find(u => u.id === parseInt(req.params.id));
    if (!token) return res.status(404).send('Token no encontrado');
    res.json(token);
});

// Crear un nuevo token
router.post('/', (req, res) => {
    const nuevotoken = {
        id: tokens.length + 1,
        token: req.body.token,
    };
    tokens.push(nuevotoken);
    res.status(201).json(nuevotoken);
});

// Actualizar un token
router.put('/:id', (req, res) => {
    const token = tokens.find(u => u.id === parseInt(req.params.id));
    if (!token) return res.status(404).send('token no encontrado');
    token.token = req.body.token;
    res.json(token);
});

// Eliminar un token
router.delete('/:id', (req, res) => {
    tokens = tokens.filter(u => u.id !== parseInt(req.params.id));
    res.status(204).send();
});

module.exports = router;
