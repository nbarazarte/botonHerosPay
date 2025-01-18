import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/styles.css'; // Importa el archivo CSS

const CreditoInmediato = () => {
    const [selectedNacionalidad, setSelectedNacionalidad] = useState('');
    const [cedula, setCedula] = useState('');
    const [nacionalidadCedula, setNacionalidadCedula] = useState('');
    const [selectedCodigoArea, setSelectedCodigoArea] = useState('');
    const [telefono, setTelefono] = useState('');
    const [numTelefono, setNumTelefono] = useState('');
    const [monto, setMonto] = useState('1.00');
    const [concepto, setConcepto] = useState('Pago de Internet');
    const [token, setToken] = useState(null);
    const [error, setError] = useState('');
    const [errorPago, setErrorPago] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [bankOptions, setBankOptions] = useState([]);
    const nacionalidad = ['V', 'E'];
    const codigosArea = ['0412', '0416', '0426', '0414', '0424'];

    const handleSelectChange = (event) => { setSelectedBank(event.target.value); };

    const handleSelectChangeNacionalidad = (e) => {
        setSelectedNacionalidad(e.target.value);
        setNacionalidadCedula(e.target.value + cedula);
    };

    const handleChangeCedula = (e) => {
        const value = e.target.value;
        // Permitir solo números (0-9)
        const onlyNumbers = value.replace(/[^0-9]/g, '');
        setCedula(onlyNumbers);
        setNacionalidadCedula(selectedNacionalidad + e.target.value);
    };

    const handleSelectChangeCodigoArea = (e) => {
        setSelectedCodigoArea(e.target.value);
        setNumTelefono(e.target.value + telefono);
    };

    const handleChangeTelefono = (e) => {
        const value = e.target.value;
        // Permitir solo números (0-9)
        const onlyNumbers = value.replace(/[^0-9]/g, '');
        setTelefono(onlyNumbers);
        setNumTelefono(selectedCodigoArea + e.target.value);
    };

    const handleChangeConcepto = (e) => {
        setConcepto(e.target.value);
    };

    const handleChangeMonto = (e) => {
        setMonto(e.target.value);
    };

    // Use useEffect to fetch bank options from the API when the component mounts
    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const response = await axios.get('http://localhost:3000/tokens/bancos');
                setBankOptions(response.data);
            } catch (error) {
                console.error('Error fetching banks:', error);
            }
        };

        fetchBanks();
    }, []); // Empty dependency array means this effect runs once when the component mounts

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedBank) { setError('Seleccione un banco'); return; }
        if (!selectedNacionalidad || !cedula) { setError('Seleccione una nacionalidad y llene la cédula'); return; }
        if (!selectedCodigoArea || !telefono) { setError('Seleccione un código de área y llene el teléfono'); return; }

        try {
            const postData = {
                Banco: selectedBank,
                Cedula: nacionalidadCedula,
                Telefono: numTelefono,
                Monto: monto,
                Concepto: concepto
            };

            // Primera petición POST: Api de Mi Banco
            const response = await axios.post('http://localhost:3001/CreditoInmediato', postData);
            setError('');

            if (response.data.code === 'ACCP') {
                try {
                    // Segunda petición GET: Api de Heros Technology
                    const secondResponse = await axios.get('http://localhost:3000/tokens/1');
                    setToken(secondResponse.data);
                    setError('');
                } catch (err) {
                    setErrorPago("Ha ocurrido un error con el token");
                    setToken(null);
                }
            } else {
                setErrorPago("Ha ocurrido un error con el pago");
            }
        } catch (err) {
            setError('error');
            setToken(null);
        }
    };

    return (
        <div className="container">
            <h3>Crédito Inmediato</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group-horizontal">
                    <select value={selectedBank} onChange={handleSelectChange}>
                        <option value="" disabled>Bancos</option>
                        {bankOptions.map((bank) => (<option key={bank.codigoban} value={bank.codigoban}>{bank.nombreban}</option>))}
                    </select>
                </div>

                <div className="form-group-horizontal">
                    <select value={selectedNacionalidad} onChange={handleSelectChangeNacionalidad}>
                        <option value="" disabled>Nac.</option>
                        {nacionalidad.map((nacio, index) => (<option key={index} value={nacio}>{nacio}</option>))}
                    </select>
                    <input
                        type="text"
                        value={cedula}
                        placeholder="Cédula"
                        onChange={handleChangeCedula}
                        maxLength={8}
                    />
                </div>

                <div className="form-group-horizontal">
                    <select value={selectedCodigoArea} onChange={handleSelectChangeCodigoArea}>
                        <option value="" disabled>Cód. Área</option>
                        {codigosArea.map((codigoArea, index) => (<option key={index} value={codigoArea}>{codigoArea}</option>))}
                    </select>
                    <input
                        type="text"
                        value={telefono}
                        placeholder="Teléfono"
                        onChange={handleChangeTelefono}
                        maxLength={7}
                    />
                </div>

                <div className="form-group-horizontal">
                    <input
                        type="text"
                        value={`Valor: $ ${monto}`}
                        onChange={handleChangeMonto}
                        maxLength={1}
                        readOnly
                    />
                </div>

                <div className="form-group-horizontal">
                    <input
                        type="text"
                        value={`Concepto: ${concepto}`}
                        onChange={handleChangeConcepto}
                        placeholder="Concepto"
                    />
                </div>

                <button type="submit">Enviar</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {token ? (
                <div>
                    <h3>Pago Aprobado</h3>
                    <p>Token: {token.token}</p>
                </div>
            ) : (
                <h3>{errorPago}</h3>
            )}
        </div>
    );
};

export default CreditoInmediato;
