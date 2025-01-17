import React, { useState } from 'react';
import axios from 'axios';
import '../assets/styles.css'; // Importa el archivo CSS

const BuscarTokens = () => {
    const [tokenId, setTokenId] = useState('');
    const [token, setToken] = useState(null);
    const [error, setError] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [selectedCodigoArea, setSelectedCodigoArea] = useState('');

    const banks = ['Banco de Venezuela', 'Banco Mercantil', 'Banplus', 'Banco Provincial', 'Banco Exterior'];

    const codigosArea = ['0412', '0416', '0426', '0414', '0424'];

    const handleSelectChange = (event) => { setSelectedBank(event.target.value); };

    const handleSelectChangeCodigoArea = (event) => { setSelectedCodigoArea(event.target.value); };

    const handleInputChange = (event) => {
        const { value, maxLength } = event.target;
        const newValue = value.replace(/\D/g, ''); // Elimina caracteres no numéricos
        event.target.value = newValue.slice(0, maxLength);
    };

    const handleChange = (e) => {
        setTokenId(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`http://localhost:3000/tokens/${tokenId}`);
            setToken(response.data);
            setError('');
        } catch (err) {
            setError('token no encontrado');
            setToken(null);
        }
    };

    return (
        <div className="container">
            <h3>Heros Pay</h3>
            <form onSubmit={handleSubmit}> {/* Cambia a handleSubmit */}

                <div className="form-group-horizontal">
                    <input
                        type="text"
                        value={tokenId}
                        onChange={handleChange}
                        placeholder="Codigo del banco"
                    />
                </div>

                <button type="submit">Buscar Token</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {token && (
                <div>
                    <h2>Detalles del Token</h2>
                    <p>Token: {token.token}</p>
                </div>
            )}
        </div>
    );
};

export default BuscarTokens;
