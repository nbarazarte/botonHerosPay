import CryptoJS from 'crypto-js';

const HeadersR4 = ({ dataToHash, tokenCommerce }) => {

    const hash2 = CryptoJS.HmacSHA256(dataToHash, tokenCommerce);
    const hmac2 = hash2.toString(CryptoJS.enc.Hex);

    return {
        'Content-Type': 'application/json',
        'Authorization': `${hmac2}`,
        'Commerce': `${tokenCommerce}`
    };
};

const obtenerFechaValor = () => {
    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

export { HeadersR4, obtenerFechaValor };
