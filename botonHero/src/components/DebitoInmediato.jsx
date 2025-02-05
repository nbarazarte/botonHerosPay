import { useParams } from 'react-router-dom';
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
import sms from "../assets/LottieFiles/Animation - 1738195342163.json";
import bankWait from "../assets/LottieFiles/Animation - 1738285370531.json";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CryptoJS from 'crypto-js';

const DebitoInmediato = () => {
    const [numeroFactura, setNumeroFactura] = useState(null)
    const { idSitio } = useParams();
    const [identificadorAp, setIdentificadorAp] = useState(null);
    const [pagoExitoso, setPagoExitoso] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [msjOtp, setMsjOtp] = useState('');
    const codigosArea = ['0412', '0416', '0426', '0414', '0424'];
    const nacionalidad = ['V', 'E', 'J'];
    const [selectedNacionalidad, setSelectedNacionalidad] = useState(nacionalidad[0]);
    const [cedula, setCedula] = useState('');
    const [nacionalidadCedula, setNacionalidadCedula] = useState('');
    const [selectedCodigoArea, setSelectedCodigoArea] = useState(codigosArea[0]);
    const [telefono, setTelefono] = useState('');
    const [numTelefono, setNumTelefono] = useState('');
    const [monto, setMonto] = useState('1.00');
    const [concepto, setConcepto] = useState('Pago de Internet');
    const [otp, setOtp] = useState('');
    const [dataForm, setDataForm] = useState({})
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [errorPago, setErrorPago] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [bankOptions, setBankOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingBankWait, setLoadingBankWait] = useState(false);
    const [text, setText] = useState("");
    const [copied, setCopied] = useState(false);
    const [idCreditoInmediato, setIdCreditoInmediato] = useState();
    const [hmac, setHmac] = useState('');
    const urlApiBoton = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR_PUBLICO;
    const urlApiMiBancoCreditoInmediato = import.meta.env.REACT_APP_URL_API_MIBANCO_CREDITOINMEDIATO;
    const urlApiMiBancoDebitoInmediato = import.meta.env.REACT_APP_URL_API_MIBANCO_DEBITOINMEDIATO;
    const urlApiMiBancoGenerarOtp = import.meta.env.REACT_APP_URL_API_MIBANCO_GENERAROTP;
    const urlApiMiBancoConsulta = import.meta.env.REACT_APP_URL_API_MIBANCO_CONSULTA;
    const urlApiMiBancoBcv = import.meta.env.REACT_APP_URL_API_MIBANCO_BCV;
    const tokenApi = import.meta.env.REACT_APP_TOKEN;
    const tokenCommerce = import.meta.env.REACT_APP_TOKEN_COMMERCE;
    const headers = { 'Authorization': `Bearer ${tokenApi}` };
    // ###########################  NOTA  ###############################
    const [url, setUrl] = useState(urlApiBoton);
    const [urlMibanco, setUrlMiBanco] = useState(urlApiMiBancoCreditoInmediato);
    const [urlMibanco2, setUrlMiBanco2] = useState(urlApiMiBancoDebitoInmediato);
    const [urlMibanco3, setUrlMiBanco3] = useState(urlApiMiBancoGenerarOtp);
    const [urlMibancoConsulta, setUrlMiBancoConsulta] = useState(urlApiMiBancoConsulta);
    const [urlMiBancoBcv, setUrlMiBancoBcv] = useState(urlApiMiBancoBcv)
    const [showOtpForm1, setShowOtpForm1] = useState(true);
    const [showOtpForm2, setShowOtpForm2] = useState(false);
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

    const handleChangeOtp = (e) => {
        setError('');
        setErrorPago('');
        setOtp(e.target.value);
        setIsVisible(true);
    };

    const handleChangeMonto = (e) => {
        setMonto(e.target.value);
    };

    useEffect(() => {
        const fetchBanksAndMonto = async () => {

            try {
                console.log('IDsitio:', idSitio);
                const response = await axios.get(`${url}sitios?idAp=${idSitio}`, { headers });
                console.log(response.data.id);
                setIdentificadorAp(response.data.id);

            } catch (error) {
                console.error("Error obteniendo id del Sitio:", error);
            }

            // Pido los bancos que usan solo debito inmediato
            try {
                const response = await axios.get(`${url}bancosDebitoInmediato`, { headers });
                setBankOptions(response.data);
            } catch (error) {
                console.error("Error obteniendo bancos:", error);
            }

            // Pido el monto de debito inmediato
            let response;
            try {
                response = await axios.get(`${url}debitoinmediato`, { headers });
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

    const handleSubmitSinOtp = async (e) => {
        e.preventDefault();

        // Intento de obtención del token
        let token;
        try {
            token = await axios.get(`${url}buscar_token`, { headers });
            //console.log(token.data.id);

            if (token.data == '') {
                let msj = `No hay tokens disponibles, \n intente luego.`;
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
            setMsjOtp('');

            // Obtener nombre del banco usando el codigo del banco
            let banco;
            try {
                banco = await axios.get(`${url}buscar_banco?codigo=${postData.Banco}`, { headers });
            } catch (error) {
                let msj = 'Error id del banco';
                //console.log(msj, error);
                setError(msj);
                return
            }

            const data1 = await handleGenerarOtp(postData);
            //console.log(data1);
            //console.log(postData);
            setMsjOtp(`En breve recibirá un mensaje al ${postData.Telefono} de ${banco.data.nombre_banco}. Copie y pegue el código recibido.`)

            setDataForm(postData) //para usarlo cuando envie con: handleSubmitConOtp

            setShowOtpForm1(false)
            setShowOtpForm2(true)

        } catch (err) {
            setError(err);
            console.error("Error-->:", err);
            setToken(null);
        } finally {
            setLoading(false); // Oculta el loading
        }
    };

    const handleSubmitConOtp = async (e) => {
        e.preventDefault();


        if (!otp) {
            setError('Indique el OTP recibido');
            setIsVisible(true);
            return;
        }
        setIsVisible(false);
        setLoading(true);
        setLoadingBankWait(true);

        try {
            const { Banco, Cedula, Telefono, Monto, Concepto } = dataForm;

            const postData = {
                Banco: Banco,
                Monto: Monto,
                Telefono: Telefono,
                Cedula: Cedula,
                Concepto: Concepto,
                Otp: otp
            };

            setError('');

            const data1 = await handleDebitoInmediato(postData);
            let data2 = {}
            //console.log(data1);

            if (data1.code === 'AC00') {
                // await new Promise(resolve => setTimeout(resolve, 10000));// Espero 10 segundos antes de hacer la consulta
                // data2 = await handleConsulta(data1.id)

                // console.log(data2);

                const maxRetries = 20;
                const delay = 1000; // 1 segundo
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

                        //console.log(token.data);

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
                                referencia: data2.reference,
                                descripcion: postData.Concepto,
                                pasarela_id: 1,
                                sitio_id: identificadorAp
                            }, { headers });

                            let numeroFactura = transac.data.id.toString().padStart(5, '0');
                            console.log(numeroFactura);
                            setNumeroFactura(numeroFactura);

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
                //console.log(data1.message);

                //setError(data1.message);
                setError('La longitd del campo OTP recibida es incorrecta');
                setOtp('');
                setIsVisible(true);
                return
            }

        } catch (err) {
            setError(err);
            console.error("Error-->:", err);
            setToken(null);
        } finally {
            setLoading(false); // Oculta el loading
            setLoadingBankWait(false);
            setIsVisible(true);
        }
    };

    const handleGenerarOtp = async (postData) => {
        try {

            const { Banco, Cedula, Telefono, Monto, Concepto } = postData;
            const dataToHash2 = `${Banco}${Monto}${Telefono}${Cedula}`;
            const hash2 = CryptoJS.HmacSHA256(dataToHash2, tokenCommerce);
            const hmac2 = hash2.toString(CryptoJS.enc.Hex);

            const headersMiBanco2 = {
                'Content-Type': 'application/json',
                'Authorization': `${hmac2}`,
                'Commerce': `${tokenCommerce}`
            };

            const data = {
                Banco: Banco,
                Monto: Monto,
                Telefono: Telefono,
                Cedula: Cedula
            }

            const miBancoGenerarOtp = await axios.post(`${urlMibanco3}`, data, { headers: headersMiBanco2 });
            //console.log(miBancoGenerarOtp.data);

            setError('');
            return miBancoGenerarOtp.data;

        } catch (error) {

            console.error('Error al realizar la consulta:', error);
            setError('Ocurrió un error al procesar la consulta');
            return null;
        }
    };

    const handleDebitoInmediato = async (postData) => {
        try {
            const { Banco, Cedula, Telefono, Monto, Concepto, Otp } = postData;
            const dataToHash = `${Banco}${Cedula}${Telefono}${Monto}${Otp}`;
            const hash = CryptoJS.HmacSHA256(dataToHash, tokenCommerce);
            const hmac = hash.toString(CryptoJS.enc.Hex);

            const headersMiBanco = {
                'Content-Type': 'application/json',
                'Authorization': `${hmac}`,
                'Commerce': `${tokenCommerce}`
            };

            const miBanco = await axios.post(`${urlMibanco2}`, postData, { headers: headersMiBanco });

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

            <div className="w-64 rounded-3xl mx-auto overflow-hidden "> {/* shadow-xl */}
                <div className="bg-white pb-0 rounded-tr-4xl">

                    {loading ? (
                        <>
                            {loadingBankWait ? (

                                <div className="flex justify-center items-center pt-24">
                                    {/* <Lottie animationData={bankWait} loop={true} style={{ width: '150px', height: '150px' }} /> */}
                                    <Lottie animationData={loadingLottie} loop={true} style={{ width: '100px', height: '100px' }} />
                                </div>
                            ) : (
                                <div className="flex justify-center items-center">
                                    <Lottie animationData={loadingLottie} loop={true} style={{ width: '100px', height: '100px' }} />
                                </div>
                            )}

                        </>

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
                                    <h1 className="text-lg">Pago Débito Inmediato</h1>
                                </div>
                            )}

                            {token && (

                                <div className="relative z-10">
                                    <div
                                        //transition
                                        className="fixed inset-0 bg-gray-300 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                                    />

                                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                                            <div
                                                //transition
                                                className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                                            >
                                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                                    <div className="sm:flex sm:items-start">

                                                        <div className="mt-3 text-center">
                                                            <div className="text-base font-semibold text-gray-900 justify-center items-center">

                                                                <div className='flex flex-row justify-center items-center text-black gap-1'>
                                                                    <div className="flex size-12 items-center justify-center rounded-full bg-green-100 ">
                                                                        <Lottie animationData={paySuccess} loop={false} style={{ width: '20px', height: '20px' }} />
                                                                    </div>
                                                                    <p className='text-lg'>¡Pago Aprobado!</p>

                                                                </div>
                                                                <p className='text-base'>N°{numeroFactura}</p>

                                                            </div>
                                                            <div className="mt-2">
                                                                <p className="text-md text-gray-500">
                                                                    Por favor, copie el token de acceso asignado en la casilla <span className='font-bold text-black'>Token *</span> que aparece en la parte inferior de esta pantalla para conectarse a la red.
                                                                </p>
                                                            </div>
                                                        </div>

                                                    </div>

                                                    <div className="flex flex-row justify-center items-center">
                                                        <div className="justify-center items-center">
                                                            <Lottie animationData={wifi} loop={true} style={{ width: '30px', height: '30px' }} />
                                                        </div>
                                                        <p className="text-lg justify-center items-center">
                                                            Token de Acceso: <span className='font-bold'>{token.token}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 py-3 flex flex-row-reverse px-6 justify-center items-center">
                                                    <button
                                                        type="button"
                                                        onClick={handleCopy}
                                                        className="inline-flex  justify-center rounded-md bg-naranjaMove px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-orange-300 sm:ml-3 sm:w-auto"
                                                    >
                                                        Copiar Token
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
                        <>
                            {
                                showOtpForm1 && (
                                    <div className="pt-10 flex flex-1 h-full justify-center items-center">
                                        <form className="mt-1" onSubmit={handleSubmitSinOtp}>
                                            <label htmlFor="bank" className="block">
                                                <select value={selectedBank} onChange={handleSelectChange} className="text-lg bg-white pl-1 pr-1 w-56 mt-0 px-0.5 border-0 border-b-1 border-azulMove focus:ring-0 focus:border-naranjaMove" id="bank">
                                                    <option value="" disabled className='text-center'>Seleccione el Banco</option>
                                                    {bankOptions.map((bank) => (
                                                        <option key={bank.codigo_banco} value={bank.codigo_banco}>{`${bank.codigo_banco} - ${bank.nombre_banco}`}</option>
                                                    ))}
                                                </select>
                                            </label>

                                            <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">

                                                <div className="relative flex-1 flex items-center">
                                                    <label htmlFor="nacionalidad" className="block">
                                                        <select value={selectedNacionalidad} onChange={handleSelectChangeNacionalidad}
                                                            className="text-lg bg-white pl-1 pr-1 w-20 px-0.5 border-0 border-b-1 border-azulMove focus:ring-0 focus:border-naranjaMove" id="nacionalidad">

                                                            <option value="" disabled className='text-center'>N/J</option>
                                                            {nacionalidad.map((nacio, index) => (
                                                                <option key={index} value={nacio} className='text-center'>{nacio}</option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                </div>

                                                <div className="relative flex-1 flex items-center">
                                                    <input id="cedula" type="number"
                                                        value={cedula}
                                                        placeholder="Cédula/RIF."
                                                        onChange={handleChangeCedula}
                                                        //maxLength={8} 
                                                        onInput={(e) => {
                                                            const maxLength = selectedNacionalidad === 'J' ? 9 : 8;
                                                            e.target.value = e.target.value.slice(0, maxLength);
                                                        }}
                                                        className="text-lg w-36 peer border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove" />
                                                    <label htmlFor="cedula" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Cédula/RIF.</label>
                                                </div>
                                            </div>

                                            <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">
                                                <div className="relative flex-1 flex items-center">
                                                    <label htmlFor="codigosArea" className="block">
                                                        <select
                                                            value={selectedCodigoArea}
                                                            onChange={handleSelectChangeCodigoArea}
                                                            className="text-lg bg-white pl-1 pr-1 w-20 px-0.5 border-0 border-b-1 border-azulMove focus:ring-0 focus:border-naranjaMove"
                                                            id="codigosArea"
                                                        >
                                                            <option value="" disabled className="text-center">
                                                                Cód.
                                                            </option>
                                                            {codigosArea.map((codigoArea, index) => (
                                                                <option key={index} value={codigoArea} className="text-center">
                                                                    {codigoArea}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                </div>

                                                <div className="relative flex-1 flex items-center">
                                                    <input
                                                        id="telefono"
                                                        type="number"
                                                        value={telefono}
                                                        placeholder="Teléfono"
                                                        onChange={handleChangeTelefono}
                                                        // maxLength={7}
                                                        onInput={(e) => {
                                                            e.target.value = e.target.value.slice(0, 7);
                                                        }}
                                                        className="text-lg w-36 peer border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove"
                                                    />
                                                    <label
                                                        htmlFor="telefono"
                                                        className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                                    >
                                                        Teléfono
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="mt-8 relative flex flex-row pl-1 pr-1">
                                                <input id="monto" type="text"
                                                    value={`Bs.${monto}`}
                                                    onChange={handleChangeMonto}
                                                    readOnly className="w-56 peer h-10 border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove" />
                                                <label htmlFor="monto" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Monto</label>
                                            </div>

                                            {/*                                             <div className="mt-8 relative flex flex-row pl-1 pr-1">
                                                <input id="concepto" type="text"
                                                    value={concepto}
                                                    onChange={handleChangeConcepto}
                                                    readOnly className="w-56 peer h-10 border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove" />
                                                <label htmlFor="concepto" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Concepto</label>
                                            </div> */}

                                            <div className='pb-2'>
                                                <button type="submit" className="mt-10 px-4 py-2 rounded-xl bg-azulMove text-white font-sans font-semibold text-sm text-center block w-full cursor-pointer">
                                                    ENVIAR DATOS DE PAGO
                                                </button>
                                            </div>

                                        </form>
                                    </div>
                                )
                            }

                            {
                                showOtpForm2 && (

                                    <>
                                        {!pagoExitoso && (

                                            <div className="flex flex-1 h-full justify-center items-center">

                                                <form className="mt-1" onSubmit={handleSubmitConOtp}>

                                                    {loading ? (
                                                        <>
                                                            <p className='text-lg text-center font-semibold'>Por favor espere mientras el banco procesa la solicitud.</p>
                                                            <div className="flex flex-1 justify-center items-center">

                                                                <Lottie animationData={bankWait} loop={true} style={{ width: '150px', height: '150px' }} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className='text-sm text-center font-semibold'>{msjOtp}</p>
                                                            <p className='text-sm text-center'>Si no recibe el mensaje, verifique sus datos ingresados, e intente nuevamente.</p>
                                                            <div className="mt-8 relative flex flex-row pl-1 pr-1 justify-center items-center">
                                                                <Lottie animationData={sms} loop={true} style={{ width: '150px', height: '150px' }} />
                                                            </div>
                                                        </>
                                                    )}

                                                    {isVisible && (
                                                        <div className="mt-8 relative flex flex-row pl-1 pr-1">
                                                            <input id="otp" type="number"
                                                                value={otp}
                                                                placeholder=""
                                                                onChange={handleChangeOtp}
                                                                onInput={(e) => { e.target.value = e.target.value.slice(0, 10) }}
                                                                className="w-56 peer h-10 border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove" />
                                                            <label htmlFor="otp" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Ingrese el código recibido</label>
                                                        </div>
                                                    )}

                                                    {!errorPago ? (
                                                        <div className='pb-2'>
                                                            {isVisible && (
                                                                <button
                                                                    type="submit"
                                                                    className="mt-10 px-4 py-2 rounded-xl bg-naranjaMove text-white font-sans font-semibold text-sm text-center block w-full cursor-pointer"
                                                                >
                                                                    CONFIRMAR PAGO
                                                                </button>
                                                            )}
                                                        </div>

                                                    ) : (
                                                        <div className='pb-2'>
                                                            <button onClick={() => window.location.reload()} className="mt-10 px-4 py-2 rounded-xl bg-azulMove text-white font-sans font-semibold text-sm text-center block w-full cursor-pointer">
                                                                IR AL INICIO
                                                            </button>
                                                        </div>
                                                    )}

                                                </form>
                                            </div>

                                        )}

                                    </>
                                )
                            }
                        </>

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

export default DebitoInmediato;