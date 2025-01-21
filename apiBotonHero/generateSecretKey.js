// generateSecretKey.js
const crypto = require('crypto');

// Generar una clave secreta de 64 bytes y convertirla en una cadena hexadecimal
const secretKey = crypto.randomBytes(64).toString('hex');
console.log(`SECRET_KEY=${secretKey}`);