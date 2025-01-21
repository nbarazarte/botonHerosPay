// middlewares/autenticarToken.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

function autenticarToken(req, res, next) {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).send('Acceso denegado. Se requiere un token.');
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send('Token inválido.');
    }
}

module.exports = autenticarToken;
