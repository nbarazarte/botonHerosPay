import React, { useState } from 'react';
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
    const [concepto, setConcepto] = useState('Pago de Servicio');
    const [token, setToken] = useState(null);
    const [error, setError] = useState('');
    const [errorPago, setErrorPago] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const bankOptions = [
        { code: '0102', name: 'Banco de Venezuela, S.A. Banco Universal' },
        { code: '0104', name: 'Banco Venezolano de Crédito, S.A.' },
        { code: '0105', name: 'Banco Mercantil, C.A. Banco Universal' },
        { code: '0108', name: 'Banco Provincial, S.A. Banco Universal' },
        { code: '0114', name: 'Bancaribe C.A. Banco Universal' },
        { code: '0115', name: 'Banco Exterior C.A. Banco Universal' },
        { code: '0128', name: 'Banco Caroní C.A. Banco Universal' },
        { code: '0134', name: 'Banesco S.A.C.A. Banco Universal' },
        { code: '0137', name: 'Banco Sofitasa C.A. Banco Universal' },
        { code: '0138', name: 'Banco Plaza C.A. Banco Universal' },
        { code: '0146', name: 'Banco de la Gente Emprendedora C.A.' },
        { code: '0151', name: 'Banco Fondo Común C.A. Banco Universal' },
        { code: '0156', name: '100% Banco, C.A. Banco Universal' },
        { code: '0157', name: 'DelSur, C.A. Banco Universal' },
        { code: '0163', name: 'Banco del Tesoro C.A. Banco Universal' },
        { code: '0166', name: 'Banco Agrícola de Venezuela C.A.' },
        { code: '0168', name: 'Bancrecer, S.A. Banco Microfinanciero' },
        { code: '0169', name: 'Mi Banco C.A. Banco Microfinanciero' },
        { code: '0171', name: 'Banco Activo C.A. Banco Universal' },
        { code: '0172', name: 'Bancamiga C.A. Banco Microfinanciero' },
        { code: '0173', name: 'Banco Internacional de Desarrollo C.A.' },
        { code: '0174', name: 'Banplus, C.A. Banco Universal' },
        { code: '0175', name: 'Banco Bicentenario C.A. Banco Universal' },
        { code: '0177', name: 'Banco de la Fuerza Armada Nacional Bolivariana' },
        { code: '0191', name: 'Banco Nacional de Crédito C.A. Banco Universal' },
        { code: '0601', name: 'Instituto Municipal de Crédito Popular' }
    ];

    const nacionalidad = ['V', 'E'];
    const codigosArea = ['0412', '0416', '0426', '0414', '0424'];

    const handleSelectChange = (event) => { setSelectedBank(event.target.value); };

    const handleSelectChangeNacionalidad = (e) => {
        setSelectedNacionalidad(e.target.value);
        setNacionalidadCedula(e.target.value + cedula)
    };

    const handleChangeCedula = (e) => {
        const value = e.target.value;
        // Permitir solo números (0-9) 
        const onlyNumbers = value.replace(/[^0-9]/g, '');
        setCedula(onlyNumbers);
        setNacionalidadCedula(selectedNacionalidad + e.target.value)
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedBank) { setError('Seleccione un banco'); return; }
        if (!selectedNacionalidad || !cedula) { setError('Seleccione una nacionalidad y llene la cédula'); return; }
        if (!selectedCodigoArea || !telefono) { setError('Seleccione un código de área y llene el teléfono'); return; }
        //if (!monto || monto <= 0) { setError('El monto debe ser mayor a cero'); return; }
        //if (!concepto) { setError('Debe ingresar un concepto'); return; }

        try {
            const postData = {
                Banco: selectedBank,
                Cedula: nacionalidadCedula,
                Telefono: numTelefono,
                Monto: monto,
                Concepto: concepto
            };

            //console.log(postData);

            // Primera petición POST: Api de Mi Banco
            const response = await axios.post('http://localhost:3001/CreditoInmediato', postData);
            //setToken(response.data);
            setError('');

            if (response.data.code === 'ACCP') {
                try {
                    // Segunda petición GET: Api de Heros Technology
                    const secondResponse = await axios.get('http://localhost:3000/tokens/1');
                    setToken(secondResponse.data);
                    setError('');
                } catch (err) {
                    //setError(err);
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
            <form onSubmit={handleSubmit}> {/* Cambia a handleSubmit */}
                <div className="form-group-horizontal">
                    <select value={selectedBank} onChange={handleSelectChange}>
                        <option value="" disabled>Bancos</option>
                        {bankOptions.map((bank) => (<option key={bank.code} value={bank.code}> {bank.name} </option>))}
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
                    <input type="text"
                        value={telefono}
                        placeholder="Teléfono"
                        onChange={handleChangeTelefono}
                        maxLength={7} />
                </div>

                <div className="form-group-horizontal">

                    <input
                        type="text"
                        value={`$ ${monto}`}
                        onChange={handleChangeMonto}
                        maxLength={1}
                        readOnly
                    />
                </div>

                <div className="form-group-horizontal">

                    <input
                        type="text"
                        value={concepto}
                        onChange={handleChangeConcepto}
                        placeholder="Pago de Servicio"
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
