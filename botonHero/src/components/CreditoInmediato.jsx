import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import '../assets/styles.css'; // Importa el archivo CSS
import copy from "copy-to-clipboard";
import Swal from 'sweetalert2'
import Lottie from "lottie-react";
import paySuccess from "../assets/LottieFiles/Animation - 1737322786287.json";
import wifi from "../assets/LottieFiles/Animation - 1737384712836.json";
import loadingLottie from "../assets/LottieFiles/Animation - 1737389234353.json";
import formError from "../assets/LottieFiles/Animation - 1738074669174.json";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CryptoJS from 'crypto-js';

const CreditoInmediato = () => {
    const [pagoExitoso, setPagoExitoso] = useState(false)
    const nacionalidad = ['V', 'E', 'J'];
    const [selectedNacionalidad, setSelectedNacionalidad] = useState(nacionalidad[0]);
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
    const codigosArea = ['0412', '0416', '0426', '0414', '0424'];
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState("");
    const [copied, setCopied] = useState(false);
    const [idCreditoInmediato, setIdCreditoInmediato] = useState();
    const [hmac, setHmac] = useState('');
    const urlApiBoton = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR_PUBLICO;
    const urlApiMiBancoCreditoInmediato = import.meta.env.REACT_APP_URL_API_MIBANCO_CREDITOINMEDIATO;
    const urlApiMiBancoConsulta = import.meta.env.REACT_APP_URL_API_MIBANCO_CONSULTA;
    const urlApiMiBancoBcv = import.meta.env.REACT_APP_URL_API_MIBANCO_BCV;
    const tokenApi = import.meta.env.REACT_APP_TOKEN;
    const tokenCommerce = import.meta.env.REACT_APP_TOKEN_COMMERCE;
    const headers = { 'Authorization': `Bearer ${tokenApi}` };
    // ###########################  NOTA  ###############################
    const [url, setUrl] = useState(urlApiBoton);
    const [urlMibanco, setUrlMiBanco] = useState(urlApiMiBancoCreditoInmediato);
    const [urlMibancoConsulta, setUrlMiBancoConsulta] = useState(urlApiMiBancoConsulta);
    const [urlMiBancoBcv, setUrlMiBancoBcv] = useState(urlApiMiBancoBcv)
    // ###################################################################

    const handleCopy = () => {
        //console.log('copiando');
        copy(token.token, {
            debug: true,
            message: "Press #{key} to copy"
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 3000); // Reset after 3 seconds
    };

    const handleSelectChange = (event) => { setSelectedBank(event.target.value); setError(''); };

    const handleSelectChangeNacionalidad = (e) => {
        setError('');
        setSelectedNacionalidad(e.target.value);
        setNacionalidadCedula(e.target.value + cedula);

        // Limpiar el input de cedula si se selecciona 'V' o 'E'
        if (e.target.value === 'V' || e.target.value === 'E' || e.target.value === 'J') {
            setCedula('');
        }
    };

    const handleChangeCedula = (e) => {
        setError('');
        const value = e.target.value;
        // Permitir solo números (0-9)
        const onlyNumbers = value.replace(/[^0-9]/g, '');
        setCedula(onlyNumbers);
        setNacionalidadCedula(selectedNacionalidad + onlyNumbers);
    };

    const handleSelectChangeCodigoArea = (e) => {
        setError('');
        setSelectedCodigoArea(e.target.value);
        setNumTelefono(e.target.value + telefono);
    };

    const handleChangeTelefono = (e) => {
        setError('');
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

    useEffect(() => {
        const fetchBanksAndMonto = async () => {
            // Pido los bancos que usan solo credito inmediato
            try {
                const response = await axios.get(`${url}bancos`, { headers });
                setBankOptions(response.data);
            } catch (error) {
                console.error("Error obteniendo bancos:", error);
            }

            // Pido el monto de credito inmediato
            let response;
            try {
                response = await axios.get(`${url}creditoinmediato`, { headers });
                // setMonto(response.data[0].monto);
                //console.log(response.data[0].monto);

            } catch (error) {
                console.error("Error obteniendo monto:", error);
            }

            // Consulto la tasa del BCV del dia
            try {
                function obtenerFechaValor() {
                    const fechaActual = new Date();
                    const año = fechaActual.getFullYear();
                    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
                    const dia = String(fechaActual.getDate()).padStart(2, '0');
                    return `${año}-${mes}-${dia}`;
                }

                const fechaValor = obtenerFechaValor();
                // console.log(fechaValor); // Salida: "2024-07-23" (la fecha actual en el formato YYYY-MM-DD)

                const dataToHash = `${fechaValor}USD`;
                const hash = CryptoJS.HmacSHA256(dataToHash, tokenCommerce);
                const hmac = hash.toString(CryptoJS.enc.Hex);

                const postData = {
                    Moneda: "USD",
                    Fechavalor: fechaValor
                }

                const headersMiBanco = {
                    'Content-Type': 'application/json',
                    'Authorization': `${hmac}`,
                    'Commerce': `${tokenCommerce}`
                };

                const tasaBcv = await axios.post(`${urlMiBancoBcv}`, postData, { headers: headersMiBanco });

                //console.log(tasaBcv.data.tipocambio);
                setMonto((response.data[0].monto * tasaBcv.data.tipocambio).toFixed(2));

            } catch (error) {
                console.error('Error al realizar la solicitud:', error);
                setError('Ocurrió un error al procesar la solicitud');
                return null;
            }
        };

        fetchBanksAndMonto();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedBank) { setError('Seleccione un Banco'); return; }
        if (!selectedNacionalidad || !cedula) { setError('Indique Cédula o RIF'); return; }
        if (!selectedCodigoArea || !telefono) { setError('Indique Teléfono'); return; }

        setLoading(true);

        try {
            const postData = {
                Banco: selectedBank,
                Monto: monto,
                Telefono: numTelefono,
                Cedula: nacionalidadCedula,
                Concepto: concepto
            };

            setError('');

            const data1 = await handleCreditoInmediato(postData);
            let data2 = {}

            if (data1.code === 'AC00') {
                //await new Promise(resolve => setTimeout(resolve, 10000));// Espero 10 segundos antes de hacer la consulta
                //data2 = await handleConsulta(data1.id)

                const maxRetries = 20;
                const delay = 2000; // 2 segundos
                let attempts = 0;

                const retryConsulta = async (id) => {
                    while (attempts < maxRetries) {
                        attempts++;
                        try {
                            data2 = await handleConsulta(id);
                            //console.log(data2);

                            if (data2.code !== 'AC00') {// esto lo hago porque la respuesta de la consulta no es la esperada
                                break;
                            }
                        } catch (error) {
                            console.error("Error en la consulta:", error);
                        }
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                };

                await retryConsulta(data1.id);

                if (data2.code === 'ACCP') {
                    try {
                        // Intento de obtención del token
                        let token;
                        try {
                            token = await axios.get(`${url}buscar_token`, { headers });

                            if (token.data == '') {
                                let msj = 'No hay tokens disponibles';
                                //console.log(msj, error);
                                setError(msj);
                                return
                            }

                        } catch (error) {
                            let msj = 'Fallo obteniendo token';
                            //console.log(msj, error);
                            setError(msj);
                            return
                        }

                        setToken(token.data);
                        setError('');

                        // Actualización del token
                        try {
                            await axios.put(`${url}${token.data.id}`, { used: true }, { headers });
                        } catch (error) {
                            let msj = 'No se actualizo el token';
                            //console.log(msj, error);
                            setError(msj);
                            return
                        }

                        // Obtener id del banco usando el codigo del banco
                        let banco;
                        try {
                            banco = await axios.get(`${url}buscar_banco?codigo=${postData.Banco}`, { headers });
                        } catch (error) {
                            let msj = 'Error id del banco';
                            //console.log(msj, error);
                            setError(msj);
                            return
                        }

                        let cliente = null;
                        let cliente_id = null;

                        // Obtener id del cliente usando la cedula
                        try {
                            cliente = await axios.get(`${url}buscar_cliente?cedula=${postData.Cedula}`, { headers });
                        } catch (error) {
                            let msj = 'Error id del cliente';
                            //console.log(msj, error);
                            setError(msj);
                            return
                        }

                        if (cliente.data.id) {
                            cliente_id = cliente.data.id;
                        } else {
                            // Guardo al cliente:
                            try {
                                cliente = await axios.post(`${url}crear_cliente`, { cedula: postData.Cedula }, { headers });
                            } catch (error) {
                                let msj = 'Error guardar cliente';
                                //console.log(msj, error);
                                setError(msj);
                                return
                            }
                            cliente_id = cliente.data.id;
                        }

                        // Guardo el cliente_id y token_id
                        let cliente_token;
                        try {
                            cliente_token = await axios.post(`${url}cliente_tokens`, {
                                cliente_id: cliente_id,
                                token_id: token.data.id
                            }, { headers });
                        } catch (error) {
                            let msj = 'Error guardar cliente_token';
                            //console.log(msj, error);
                            setError(msj);
                            return
                        }
                        //console.log(cliente_token.data);

                        // Guardo la transacción
                        let transac;
                        try {
                            transac = await axios.post(`${url}crear_transac`, {
                                cliente_token_id: cliente_token.data.id,
                                telefono: postData.Telefono,
                                banco_id: banco.data.id,
                                monto: postData.Monto,
                                referencia: '1234',//miBanco.data.reference,
                                descripcion: ''
                            }, { headers });
                        } catch (error) {
                            let msj = 'Error guardar transaccion';
                            //console.log(msj, error);
                            setError(msj);
                            return
                        }
                        //console.log(transac.data);
                        setPagoExitoso(true);

                    } catch (err) {
                        setError("Ha ocurrido un error con el token");
                        setToken(null);
                    }
                } else {
                    setError('');
                    setError(data2.message);
                    setErrorPago(data2.code);
                    return
                }

            } else {

                setError(data1.message);
                return
            }

        } catch (err) {
            setError(err);
            console.error("Error-->:", err);
            setToken(null);
        } finally {
            setLoading(false); // Oculta el loading
        }
    };

    const handleCreditoInmediato = async (postData) => {
        try {
            const { Banco, Cedula, Telefono, Monto, Concepto } = postData;
            const dataToHash = `${Banco}${Cedula}${Telefono}${Monto}`;
            const hash = CryptoJS.HmacSHA256(dataToHash, tokenCommerce);
            const hmac = hash.toString(CryptoJS.enc.Hex);

            const headersMiBanco = {
                'Content-Type': 'application/json',
                'Authorization': `${hmac}`,
                'Commerce': `${tokenCommerce}`
            };

            const miBanco = await axios.post(`${urlMibanco}`, postData, { headers: headersMiBanco });

            setError('');
            return miBanco.data;

        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
            setError('Ocurrió un error al procesar la solicitud');
            return null;
        }
    }

    const handleConsulta = async (id) => {
        try {

            const dataToHash2 = `${id}`;
            const hash2 = CryptoJS.HmacSHA256(dataToHash2, tokenCommerce);
            const hmac2 = hash2.toString(CryptoJS.enc.Hex);

            const headersMiBanco2 = {
                'Content-Type': 'application/json',
                'Authorization': `${hmac2}`,
                'Commerce': `${tokenCommerce}`
            };

            const data = {
                id: `${id}`
            }

            const miBancoConsulta = await axios.post(`${urlMibancoConsulta}`, data, { headers: headersMiBanco2 });

            setError('');
            return miBancoConsulta.data;

        } catch (error) {
            console.error('Error al realizar la consulta:', error);
            setError('Ocurrió un error al procesar la consulta');
            return null;
        }
    };

    return (

        <div className="flex flex-1 w-screen h-screen justify-center items-start justify-items-center">

            <div className="w-64 rounded-3xl mx-auto overflow-hidden"> {/* shadow-xl */}
                <div className="bg-white pb-0 rounded-tr-4xl">
                    {/* <h1 className="text-2xl font-semibold text-gray-900">Crédito Inmediato</h1> */}

                    {loading ? (
                        <div className="flex justify-center items-center">
                            <Lottie animationData={loadingLottie} loop={true} style={{ width: '100px', height: '100px' }} />
                        </div>
                    ) : (

                        <>
                            {error ? (
                                <div className="flex justify-center items-center pt-3">

                                    <div className="flex flex-row justify-center items-center gap-1 bg-orange-200 border-t-4 border-naranjaMove rounded-b text-black px-4 py-3 shadow-md w-60">
                                        <Lottie animationData={formError} loop={true} style={{ width: '40px', height: '40px' }} />
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                            ) : (

                                <div className="justify-center items-center text-center pt-3 pb-3">
                                    <h1 className="text-2xl">Pasarela de Pagos</h1>
                                    <h3 className="text-sm font-semibold">Crédito Inmediato</h3>
                                </div>
                            )}

                            {token && (

                                <div className="flex justify-center items-center">
                                    <div className="bg-green-100 border-t-4 border-green-500 rounded-b text-green-900 px-4 py-1 shadow-md w-60" role="alert">

                                        <div className="flex justify-center items-center text-center">
                                            <div className='justify-center items-center' >

                                                <div className="flex flex-row justify-center items-center gap-1">
                                                    <Lottie animationData={paySuccess} loop={false} style={{ width: '20px', height: '20px' }} />
                                                    <p className="text-sm">¡Aprobado!</p>
                                                </div>

                                                <div className="flex flex-row justify-center items-center gap-1">
                                                    <Lottie animationData={wifi} loop={true} style={{ width: '30px', height: '30px' }} />
                                                    <p className="text-sm justify-center items-center">
                                                        Token de acceso: <span className='font-bold'>{token.token}</span>
                                                    </p>

                                                    <button className="hover:text-black text-gray-400 text-center cursor-pointer" onClick={handleCopy}>
                                                        <FontAwesomeIcon icon="fa-regular fa-copy" />
                                                    </button>
                                                </div>

                                            </div>
                                        </div>

                                    </div>
                                </div>

                            )}
                        </>
                    )}

                    {!bankOptions.length == 0 ? (

                        <div className="flex flex-1 h-full justify-center items-center">
                            <form className="mt-1" onSubmit={handleSubmit}>
                                <label htmlFor="bank" className="block">
                                    <select value={selectedBank} onChange={handleSelectChange} className="pl-1 pr-1 w-56 mt-0 px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-naranjaMove" id="bank">
                                        <option value="" disabled className='text-center'>Seleccione el Banco</option>
                                        {bankOptions.map((bank) => (
                                            <option key={bank.codigo_banco} value={bank.codigo_banco}>{`${bank.codigo_banco} - ${bank.nombre_banco}`}</option>
                                        ))}
                                    </select>
                                </label>

                                <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">

                                    <div className="relative flex-1">
                                        <label htmlFor="nacionalidad" className="block">
                                            <select value={selectedNacionalidad} onChange={handleSelectChangeNacionalidad}
                                                className="pl-1 pr-1 w-20 mt-0 px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-naranjaMove" id="nacionalidad">

                                                <option value="" disabled className='text-center'>N/J</option>
                                                {nacionalidad.map((nacio, index) => (
                                                    <option key={index} value={nacio} className='text-center'>{nacio}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    <div className="relative flex-1">
                                        <input id="cedula" type="number"
                                            value={cedula}
                                            placeholder="Cédula/RIF."
                                            onChange={handleChangeCedula}
                                            //maxLength={8} 
                                            onInput={(e) => {
                                                const maxLength = selectedNacionalidad === 'J' ? 9 : 8;
                                                e.target.value = e.target.value.slice(0, maxLength);
                                            }}
                                            className="w-36 peer border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove" />
                                        <label htmlFor="cedula" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Cédula/RIF.</label>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">

                                    <div className="relative flex-1">
                                        <label htmlFor="codigosArea" className="block">
                                            <select value={selectedCodigoArea} onChange={handleSelectChangeCodigoArea}
                                                className="pl-1 pr-1 w-20 mt-0 px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-naranjaMove" id="codigosArea">
                                                <option value="" disabled className='text-center'>Cód.</option>
                                                {codigosArea.map((codigoArea, index) => (
                                                    <option key={index} value={codigoArea} className='text-center'>{codigoArea}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    <div className="relative flex-1">
                                        <input id="telefono" type="number"
                                            value={telefono}
                                            placeholder="Teléfono"
                                            onChange={handleChangeTelefono}
                                            //maxLength={7} 
                                            onInput={(e) => { e.target.value = e.target.value.slice(0, 7) }}
                                            className="w-36 peer border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove" />
                                        <label htmlFor="telefono" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Teléfono</label>
                                    </div>

                                </div>

                                <div className="mt-8 relative flex flex-row pl-1 pr-1">
                                    <input id="monto" type="text"
                                        value={`Bs.${monto}`}
                                        onChange={handleChangeMonto}
                                        readOnly className="w-56 peer h-10 border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove" />
                                    <label htmlFor="monto" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Monto</label>
                                </div>

                                <div className="mt-8 relative flex flex-row pl-1 pr-1">
                                    <input id="concepto" type="text"
                                        value={concepto}
                                        onChange={handleChangeConcepto}
                                        readOnly className="w-56 peer h-10 border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove" />
                                    <label htmlFor="concepto" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Concepto</label>
                                </div>

                                {(!token || loading) && (
                                    <div className='pb-2'>
                                        <button type="submit" className="mt-10 px-4 py-2 rounded-xl bg-azulMove text-white font-semibold text-center block w-full cursor-pointer">
                                            VERIFICAR
                                        </button>
                                    </div>
                                )}

                            </form>
                        </div>

                    ) : (
                        <div className="flex flex-1 h-full justify-center items-center">
                            <Lottie animationData={loadingLottie} loop={false} style={{ width: '100px', height: '100px' }} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
};

export default CreditoInmediato;