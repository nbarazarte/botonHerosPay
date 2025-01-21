const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Asegúrate de especificar la ruta correcta si tu archivo .env no está en el directorio raíz
dotenv.config({ path: './.env' });

const SECRET_KEY = process.env.SECRET_KEY;
console.log("SECRET_KEY:", SECRET_KEY); // Para verificar si la clave se está cargando correctamente

function generarToken(payload) {
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1y' }); //1h una hora, 1y un anio
    return token;
}

const user = { id: 1, name: 'Neel Barazarte' };
const token = generarToken(user);
console.log("Token generado:", token);
