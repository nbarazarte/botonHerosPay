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

export default HeadersR4
