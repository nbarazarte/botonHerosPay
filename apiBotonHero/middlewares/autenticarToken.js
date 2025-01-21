const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Cargar las variables de entorno del archivo .env
dotenv.config({ path: '../env' });

const SECRET_KEY = process.env.SECRET_KEY;

function autenticarToken(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).send('Acceso denegado. Se requiere un token.');
    }

    const token = authHeader.replace('Bearer ', '');
    //console.log("Token a verificar: ", token);

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        //console.log("Token decodificado: ", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("Error al verificar el token: ", error);
        res.status(400).send('Token inválido.');
    }
}

module.exports = autenticarToken;
