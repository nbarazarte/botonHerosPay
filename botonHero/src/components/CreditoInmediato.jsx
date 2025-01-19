import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import '../assets/styles.css'; // Importa el archivo CSS
import copy from "copy-to-clipboard";
import Swal from 'sweetalert2'
import Lottie from "lottie-react";
import paySuccess from "../assets/LottieFiles/Animation - 1737322786287.json";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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

    const [text, setText] = useState("");
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        //console.log('copiando');
        copy(token.token, {
            debug: true,
            message: "Press #{key} to copy"
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 3000); // Reset after 3 seconds
    };

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
        setNacionalidadCedula(selectedNacionalidad + onlyNumbers);
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
        setNumTelefono(selectedCodigoArea + onlyNumbers);
    };

    const handleChangeConcepto = (e) => {
        setConcepto(e.target.value);
    };

    const handleChangeMonto = (e) => {
        setMonto(e.target.value);
    };

    // Llamo a la lista de los bancos nacionales
    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const response = await axios.get('http://localhost:3000/tokens/bancos');
                setBankOptions(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchBanks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedBank) { setError('Seleccione un banco'); return; }
        if (!selectedNacionalidad || !cedula) { setError('Indíque nacionalidad y cédula'); return; }
        if (!selectedCodigoArea || !telefono) { setError('Indíque código y teléfono'); return; }

        try {
            const postData = {
                Banco: selectedBank,
                Cedula: nacionalidadCedula,
                Telefono: numTelefono,
                Monto: monto,
                Concepto: concepto
            };

            console.log(postData);

            // Primera petición POST: Api de Mi Banco
            const response = await axios.post('http://localhost:3001/CreditoInmediato', postData);
            setError('');

            if (response.data.code === 'ACCP') {
                try {
                    // Api de Heros Technology Segunda petición GET: Solicita un token para asignarlo
                    const secondResponse = await axios.get('http://localhost:3000/tokens');
                    //console.log(secondResponse.data);
                    setToken(secondResponse.data);
                    setError('');

                    // Api de Heros Technology Tercera petición PUT: Actualiza el token para marcarlo como usado 
                    await axios.put(`http://localhost:3000/tokens/${secondResponse.data.id}`, { used: true });

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

    useEffect(() => {
        if (token) {
            setText(token.token);
            handleCopy();
            Swal.fire({
                position: "center",
                icon: "success",
                title: `Token: ${token.token} copiado!`,
                showConfirmButton: false,
                timer: 1500
            });
        }
    }, [token]);

    return (
        <div className="p-8 flex-1">
            <div className="w-80 bg-white rounded-3xl mx-auto overflow-hidden "> {/* shadow-xl */}
                <div className="px-10 pt-4 pb-8 bg-white rounded-tr-4xl">
                    <h1 className="text-2xl font-semibold text-gray-900">Crédito Inmediato</h1>
                    {error && (
                        <div className="flex justify-center items-center">
                            <div className="bg-red-100 border-t-4 border-red-500 rounded-b text-teal-900 px-4 py-3 shadow-md w-full" role="alert">
                                <div className="flex justify-center items-center text-center">
                                    <div>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {token ? (
                        <div>
                            <div className="flex justify-center items-center">
                                <div className="bg-green-100 border-t-4 border-green-500 rounded-b text-green-900 px-4 py-1 shadow-md w-full" role="alert">

                                    <div className="flex justify-center items-center text-center">
                                        <div className='justify-center items-center' >

                                            <div className="flex flex-row justify-center items-center gap-1">
                                                <Lottie animationData={paySuccess} loop={false} style={{ width: '20px', height: '20px' }} />
                                                <p className="text-sm">¡Aprobado!</p>
                                            </div>

                                            <div className="flex flex-row justify-center items-center gap-1">
                                                <p className="text-sm justify-center items-center">
                                                    Su token de acceso es: <span className='font-bold'>{token.token}</span>
                                                </p>

                                                <button className="hover:text-black text-gray-400 text-center cursor-pointer" onClick={handleCopy}>
                                                    <FontAwesomeIcon icon="fa-regular fa-copy" />
                                                </button>
                                            </div>

                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ) : (

                        <>
                            {errorPago && (
                                <div className="flex justify-center items-center">
                                    <div className="bg-red-100 border-t-4 border-red-500 rounded-b text-teal-900 px-4 py-3 shadow-md w-full" role="alert">
                                        <div className="flex justify-center items-center text-center">
                                            <div>
                                                <p className="text-sm">{errorPago}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <form className="mt-12" onSubmit={handleSubmit}>
                        <label htmlFor="bank" className="block">
                            <select value={selectedBank} onChange={handleSelectChange} className="block w-full mt-0 px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black" id="bank">
                                <option value="" disabled>Bancos</option>
                                {bankOptions.map((bank) => (
                                    <option key={bank.codigoban} value={bank.codigoban}>{`${bank.codigoban} - ${bank.nombreban}`}</option>
                                ))}
                            </select>
                        </label>

                        <div className="mt-10 flex flex-row justify-between gap-1">

                            <div className="relative flex-1">
                                <label htmlFor="nacionalidad" className="block">
                                    <select value={selectedNacionalidad} onChange={handleSelectChangeNacionalidad} className="block border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black" id="nacionalidad">
                                        <option value="" disabled>Nac.</option>
                                        {nacionalidad.map((nacio, index) => (
                                            <option key={index} value={nacio}>{nacio}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="relative flex-1">
                                <input id="cedula" type="text"
                                    value={cedula}
                                    placeholder="Cédula"
                                    onChange={handleChangeCedula}
                                    maxLength={8} className="peer border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-rose-600" />
                                <label htmlFor="cedula" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Cédula</label>
                            </div>
                        </div>

                        <div className="mt-1 flex flex-row justify-between gap-1">

                            <div className="mt-10 relative">
                                <label htmlFor="telefono" className="block">
                                    <select value={selectedCodigoArea} onChange={handleSelectChangeCodigoArea} className="block border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black" id="telefono">
                                        <option value="" disabled>Cód.</option>
                                        {codigosArea.map((codigoArea, index) => (
                                            <option key={index} value={codigoArea}>{codigoArea}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="mt-10 relative">
                                <input id="telefono" type="text"
                                    value={telefono}
                                    placeholder="Teléfono"
                                    onChange={handleChangeTelefono}
                                    maxLength={7} className="peer border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-rose-600" />
                                <label htmlFor="telefono" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Teléfono</label>
                            </div>

                        </div>

                        <div className="mt-10 relative">
                            <input id="monto" type="text"
                                value={`$${monto}`}
                                onChange={handleChangeMonto}
                                readOnly className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-rose-600" />
                            <label htmlFor="monto" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Monto</label>
                        </div>

                        <div className="mt-10 relative">
                            <input id="concepto" type="text"
                                value={concepto}
                                onChange={handleChangeConcepto}
                                placeholder="Concepto" className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-rose-600" />
                            <label htmlFor="concepto" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Concepto</label>
                        </div>

                        {token ? (
                            <div className='mt-10 px-4 py-2 '>
                                Aparece el otro formulario para pegar el token
                            </div>
                        ) : (

                            <>
                                <button type="submit" className="mt-10 px-4 py-2 rounded bg-rose-500 hover:bg-rose-400 text-white font-semibold text-center block w-full focus:outline-none focus:ring focus:ring-offset-2 focus:ring-rose-500 focus:ring-opacity-80 cursor-pointer">Verificar</button>
                            </>
                        )}

                    </form>
                </div>
            </div>
        </div>
    )
};

export default CreditoInmediato;
