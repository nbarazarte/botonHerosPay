import { useParams } from 'react-router-dom';
import platform from 'platform'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'
import Lottie from "lottie-react";
import loadingLottie from "../assets/LottieFiles/Animation - 1737389234353.json";
import formError from "../assets/LottieFiles/Animation - 1738074669174.json";
import CryptoJS from 'crypto-js';
import ErrorApiR4 from './ErrorApiR4';
import Success from './Success';
import Form1 from './Form1';
import Form2 from './Form2';

const DebitoInmediato = () => {

    const [vieneForm1, setVieneForm1] = useState(false);
    const [so, setSO] = useState('');
    const [mensajeApis, setMensajeApis] = useState('');
    const [textoBoton, setTextoBoton] = useState('Copiar Token')
    const [numeroFactura, setNumeroFactura] = useState(null)
    const { idSitio } = useParams();
    const [identificadorAp, setIdentificadorAp] = useState(null);
    const [pagoExitoso, setPagoExitoso] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [msjOtp, setMsjOtp] = useState('');
    const [msjOtp2, setMsjOtp2] = useState('');
    const codigosArea = ['0412', '0416', '0426', '0414', '0424'];
    const nacionalidad = ['V', 'E', 'J'];
    const [selectedNacionalidad, setSelectedNacionalidad] = useState(nacionalidad[0]);
    const [cedula, setCedula] = useState('');
    const [nacionalidadCedula, setNacionalidadCedula] = useState('');
    const [selectedCodigoArea, setSelectedCodigoArea] = useState('');
    const [telefono, setTelefono] = useState('');
    const [numTelefono, setNumTelefono] = useState('');
    const [monto, setMonto] = useState('1.00');
    const [concepto, setConcepto] = useState('Pago de Internet');
    const [otp, setOtp] = useState('');
    const [dataForm, setDataForm] = useState({})
    const [token, setToken] = useState('');
    const [error, setError] = useState(null);
    const [errorPago, setErrorPago] = useState('');
    const [errorApiR4, setErrorApiR4] = useState(null);
    const [selectedBank, setSelectedBank] = useState('');
    const [bankOptions, setBankOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingBankWait, setLoadingBankWait] = useState(false);
    const [text, setText] = useState("");
    const [copied, setCopied] = useState(false);
    const [idCreditoInmediato, setIdCreditoInmediato] = useState();
    const [hmac, setHmac] = useState('');
    const [timeLeft, setTimeLeft] = useState(59);
    const [showOtpForm1, setShowOtpForm1] = useState(true);
    const [showOtpForm2, setShowOtpForm2] = useState(false);
    // ###########################  URLS  ###############################
    const url = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR_PUBLICO;
    const urlMibanco2 = import.meta.env.REACT_APP_URL_API_MIBANCO_DEBITOINMEDIATO;
    const urlMibanco3 = import.meta.env.REACT_APP_URL_API_MIBANCO_GENERAROTP;
    const urlMibancoConsulta = import.meta.env.REACT_APP_URL_API_MIBANCO_CONSULTA;
    const urlMiBancoBcv = import.meta.env.REACT_APP_URL_API_MIBANCO_BCV;
    const tokenCommerce = import.meta.env.REACT_APP_TOKEN_COMMERCE;
    const headers = { 'Authorization': `Bearer ${import.meta.env.REACT_APP_TOKEN}` };
    // ###################################################################

    useEffect(() => {

        const soInfo = platform.os.family;
        setSO(soInfo);

        const mensajeOtp = localStorage.getItem('mensajeOtp');
        const mensajeOtp2 = localStorage.getItem('mensajeOtp2');
        const dataFormulario = JSON.parse(localStorage.getItem('dataFormulario'));
        const formulario1 = localStorage.getItem('formulario1');
        const formulario2 = localStorage.getItem('formulario2');

        if (mensajeOtp != null) {

            setMsjOtp(mensajeOtp);
            setMsjOtp2(mensajeOtp2);
            setDataForm(dataFormulario);
            setShowOtpForm1(formulario1);
            setShowOtpForm2(formulario2);
            setTimeLeft(0);
        }

        const fetchBanksAndMonto = async () => {

            // Pido el monto de débito inmediato y en caso de fallar muestra una pantalla
            let monto;
            try {

                monto = await axios.get(`${url}debitoinmediato`, { headers });
                const sitio = await axios.get(`${url}sitios?idAp=${idSitio}`, { headers });
                setIdentificadorAp(sitio.data.id);
                const bancos = await axios.get(`${url}bancosDebitoInmediato`, { headers });
                setBankOptions(bancos.data);

            } catch (error) {

                setMensajeApis('Falla de conexión con el Servidor');
                let mensaje = 'En estos momentos, el servidor no está disponible. Por favor, intente más tarde.'
                setError(mensaje);
                setErrorApiR4(mensaje);
                return null;
            }

            // Consulto la tasa del BCV del dia y en caso de fallar muestra una pantalla
            try {
                function obtenerFechaValor() {
                    const fechaActual = new Date();
                    const año = fechaActual.getFullYear();
                    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
                    const dia = String(fechaActual.getDate()).padStart(2, '0');
                    return `${año}-${mes}-${dia}`;
                }

                const fechaValor = obtenerFechaValor();
                const dataToHash = `${fechaValor}USD`;
                const headersMiBanco = headersR4(dataToHash)

                const postData = {
                    Moneda: "USD",
                    Fechavalor: fechaValor
                }

                const tasaBcv = await axios.post(`${urlMiBancoBcv}`, postData, { headers: headersMiBanco });
                setMonto((monto.data[0].monto * tasaBcv.data.tipocambio).toFixed(2));

            } catch (error) {

                setMensajeApis('Falla de conexión con el Banco');
                let mensaje = 'En estos momentos, la plataforma bancaria no está disponible. Por favor, intente más tarde.'
                setError(mensaje);
                setErrorApiR4(mensaje);
                return null;
            }
        };

        fetchBanksAndMonto();
    }, []);

    const handleSubmitSinOtp = async (e) => {
        e.preventDefault();

        // Intento de obtención del token
        try {

            const token = await axios.get(`${url}buscar_token`, { headers });
            if (!token.data) { setError(`No hay tokens disponibles, \n intente luego.`); return }
            if (!selectedBank) { setError('Seleccione un Banco'); return; }
            if (!selectedNacionalidad || !cedula) { setError('Indique Cédula o RIF'); return; }
            if (!selectedCodigoArea || !telefono) { setError('Indique Teléfono'); return; }

            setLoading(true);

            const postData = {
                Banco: selectedBank,
                Monto: monto,
                Telefono: numTelefono,
                Cedula: nacionalidadCedula,
                Concepto: concepto
            };

            // Obtener nombre del banco usando el codigo del banco
            const banco = await axios.get(`${url}buscar_banco?codigo=${postData.Banco}`, { headers });
            await handleGenerarOtp(postData);

            setMsjOtp(`En breve recibirá un mensaje al número ${postData.Telefono} de ${banco.data.nombre_banco}. Copie y pegue el código recibido.`)
            setDataForm(postData) //para usarlo cuando envie con: handleSubmitConOtp
            setShowOtpForm1(false)
            setShowOtpForm2(true)
            setVieneForm1(true)

            localStorage.setItem('mensajeOtp', `Si ya recibió el mensaje en el número ${postData.Telefono} de ${banco.data.nombre_banco}. Copie y pegue el código recibido.`);
            localStorage.setItem('mensajeOtp2', `Si no recibió el mensaje, verifique sus datos ingresados, e intente nuevamente.`)
            localStorage.setItem('dataFormulario', JSON.stringify(postData));
            localStorage.setItem('formulario1', false);
            localStorage.setItem('formulario2', true);

        } catch (err) {
            setError(err);
            setToken(null);
        } finally {
            setLoading(false); // Oculta el loading
        }

    };

    const handleSubmitConOtp = async (e) => {
        e.preventDefault();

        try {

            if (!otp) {
                setError('Indique el OTP recibido');
                setIsVisible(true);
                return;
            }
            setIsVisible(false);
            setLoading(true);
            setLoadingBankWait(true);

            let postData = {};

            if (so !== 'iOS') {
                const { Banco, Cedula, Telefono, Monto, Concepto } = dataForm;
                postData = { Banco, Monto, Telefono, Cedula, Concepto, Otp: otp };
            } else {
                const token = await axios.get(`${url}buscar_token`, { headers });
                if (!token.data) { setError('No hay tokens disponibles, intente luego.'); return }
                if (!selectedBank) { setError('Seleccione un Banco'); return; }
                if (!selectedNacionalidad || !cedula) { setError('Indique Cédula o RIF'); return; }
                if (!selectedCodigoArea || !telefono) { setError('Indique Teléfono'); return; }

                postData = {
                    Banco: selectedBank,
                    Monto: monto,
                    Telefono: numTelefono,
                    Cedula: nacionalidadCedula,
                    Concepto: concepto,
                    Otp: otp
                };
            }

            const data1 = await handleDebitoInmediato(postData);

            let data2 = {}
            if (data1.code === 'AC00') {

                const maxRetries = 20;
                const delay = 1000; // 1 segundo
                let attempts = 0;

                const retryConsulta = async (id) => {
                    while (attempts < maxRetries) {
                        attempts++;
                        data2 = await handleConsulta(id);
                        if (data2.code !== 'AC00') { break; } // esto lo hago porque la respuesta de la consulta no es la esperada
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                };

                await retryConsulta(data1.id);

                // Si el pago fue aceptado
                if (data2.code === 'ACCP') {

                    // Intento de obtención del token
                    const token = await axios.get(`${url}buscar_token`, { headers });
                    if (!token.data) { setError('No hay tokens disponibles'); return }
                    setToken(token.data);

                    // Actualización del token
                    await axios.put(`${url}${token.data.id}`, { used: true }, { headers });

                    // Obtener id del banco usando el codigo del banco
                    const banco = await axios.get(`${url}buscar_banco?codigo=${postData.Banco}`, { headers });

                    // Obtener id del cliente usando la cedula
                    let cliente = await axios.get(`${url}buscar_cliente?cedula=${postData.Cedula}`, { headers });

                    if (!cliente.data.id) {
                        cliente = await axios.post(`${url}crear_cliente`, { cedula: postData.Cedula }, { headers });
                    }

                    // Guardo el cliente_id y token_id
                    const cliente_token = await axios.post(`${url}cliente_tokens`, {
                        cliente_id: cliente.data.id,
                        token_id: token.data.id
                    }, { headers });

                    // Guardo la transacción
                    const transac = await axios.post(`${url}crear_transac`, {
                        cliente_token_id: cliente_token.data.id,
                        telefono: postData.Telefono,
                        banco_id: banco.data.id,
                        monto: postData.Monto,
                        referencia: data2.reference,
                        descripcion: postData.Concepto,
                        pasarela_id: 1,
                        sitio_id: identificadorAp,
                        sistema_operativo:so
                    }, { headers });

                    setNumeroFactura(transac.data.id.toString().padStart(5, '0'));
                    setPagoExitoso(true);

                } else {
                    setError(data2.message);
                    setErrorPago(data2.code);
                    return
                }

            } else {

                setError('La longitd del campo OTP recibida es incorrecta');
                setIsVisible(true);
                return
            }

        } catch (err) {

            setError(err);
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
            const dataToHash = `${Banco}${Monto}${Telefono}${Cedula}`;
            const headersMiBanco = headersR4(dataToHash);

            const data = {
                Banco: Banco,
                Monto: Monto,
                Telefono: Telefono,
                Cedula: Cedula
            }

            const miBancoGenerarOtp = await axios.post(`${urlMibanco3}`, data, { headers: headersMiBanco });

            if (timeLeft > 0) {
                const interval = setInterval(() => {
                    setTimeLeft((prevTime) => {
                        if (prevTime - 1 <= 0) {
                            clearInterval(interval);
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);

                return () => clearInterval(interval);
            }

            return miBancoGenerarOtp.data;

        } catch (error) {

            console.error('Error al realizar la consulta:', error);
            setError('Ocurrió un error al procesar la consulta');
            setErrorApiR4('En estos momentos, la plataforma bancaria no está disponible. Por favor, intente más tarde.');
            return null;
        }
    };

    const handleDebitoInmediato = async (postData) => {

        try {
            const { Banco, Cedula, Telefono, Monto, Concepto, Otp } = postData;
            const dataToHash = `${Banco}${Cedula}${Telefono}${Monto}${Otp}`;
            const headersMiBanco = headersR4(dataToHash)
            const miBanco = await axios.post(`${urlMibanco2}`, postData, { headers: headersMiBanco });
            return miBanco.data;

        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
            setError('Ocurrió un error al procesar la solicitud');
            setErrorApiR4('En estos momentos, la plataforma bancaria no está disponible. Por favor, intente más tarde.');
            return null;
        }
    }

    const handleConsulta = async (id) => {
        try {

            const dataToHash = `${id}`;
            const headersMiBanco = headersR4(dataToHash)
            const data = { id: `${id}` }
            const miBancoConsulta = await axios.post(`${urlMibancoConsulta}`, data, { headers: headersMiBanco });
            return miBancoConsulta.data;

        } catch (error) {
            console.error('Error al realizar la consulta:', error);
            setError('Ocurrió un error al procesar la consulta');
            setErrorApiR4('En estos momentos, la plataforma bancaria no está disponible. Por favor, intente más tarde.');
            return null;
        }
    };

    const headersR4 = (dataToHash) => {

        const hash2 = CryptoJS.HmacSHA256(dataToHash, tokenCommerce);
        const hmac2 = hash2.toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `${hmac2}`,
            'Commerce': `${tokenCommerce}`
        };

        return headers
    }

    return (
        <>
            {errorApiR4 ? (

                <ErrorApiR4
                    mensajeApis={mensajeApis}
                    errorApiR4={errorApiR4}
                />
            ) : (

                <div className="flex flex-1 w-screen h-screen justify-center items-start justify-items-center">
                    <div className="w-64 rounded-3xl mx-auto overflow-hidden "> {/* shadow-xl */}
                        <div className="bg-white pb-0 rounded-tr-4xl">

                            {loading ? (
                                <>
                                    {loadingBankWait ? (
                                        <div className="flex justify-center items-center pt-24">
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
                                            {/* <p>Tu sistema operativo es: {so}</p> */}
                                        </div>
                                    )}

                                    {token && (
                                        <Success
                                            numeroFactura={numeroFactura}
                                            token={token}
                                            textoBoton={textoBoton}
                                            setCopied={setCopied}
                                            setTextoBoton={setTextoBoton}
                                        />
                                    )}
                                </>
                            )}

                            {!bankOptions.length == 0 ? (
                                <>
                                    {showOtpForm1 === true && (

                                        <Form1
                                            handleSubmitSinOtp={handleSubmitSinOtp}
                                            setShowOtpForm1={setShowOtpForm1}
                                            setShowOtpForm2={setShowOtpForm2}
                                            selectedBank={selectedBank}
                                            bankOptions={bankOptions}
                                            selectedNacionalidad={selectedNacionalidad}
                                            nacionalidad={nacionalidad}
                                            cedula={cedula}
                                            setCedula={setCedula}
                                            selectedCodigoArea={selectedCodigoArea}
                                            codigosArea={codigosArea}
                                            telefono={telefono}
                                            setTelefono={setTelefono}
                                            monto={monto}
                                            setMonto={setMonto}
                                            setError={setError}
                                            setSelectedBank={setSelectedBank}
                                            setSelectedNacionalidad={setSelectedNacionalidad}
                                            setNacionalidadCedula={setNacionalidadCedula}
                                            setSelectedCodigoArea={setSelectedCodigoArea}
                                            setNumTelefono={setNumTelefono}
                                            setConcepto={setConcepto}
                                            so={so}
                                        />
                                    )}

                                    {showOtpForm2 && (

                                        <Form2
                                            pagoExitoso={pagoExitoso}
                                            handleSubmitConOtp={handleSubmitConOtp}
                                            loading={loading}
                                            vieneForm1={vieneForm1}
                                            so={so}
                                            msjOtp={msjOtp}
                                            msjOtp2={msjOtp2}
                                            timeLeft={timeLeft}
                                            isVisible={isVisible}
                                            otp={otp}
                                            selectedBank={selectedBank}
                                            bankOptions={bankOptions}
                                            selectedNacionalidad={selectedNacionalidad}
                                            nacionalidad={nacionalidad}
                                            cedula={cedula}
                                            setCedula={setCedula}
                                            selectedCodigoArea={selectedCodigoArea}
                                            codigosArea={codigosArea}
                                            telefono={telefono}
                                            setTelefono={setTelefono}
                                            monto={monto}
                                            setMonto={setMonto}
                                            setError={setError}
                                            setSelectedBank={setSelectedBank}
                                            setSelectedNacionalidad={setSelectedNacionalidad}
                                            setNacionalidadCedula={setNacionalidadCedula}
                                            setSelectedCodigoArea={setSelectedCodigoArea}
                                            setNumTelefono={setNumTelefono}
                                            setConcepto={setConcepto}
                                            error={error}
                                            setErrorPago={setErrorPago}
                                            setIsVisible={setIsVisible}
                                            setOtp={setOtp}
                                        />
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-1 h-full justify-center items-center">
                                    <Lottie animationData={loadingLottie} loop={false} style={{ width: '100px', height: '100px' }} />
                                </div>
                            )}
                        </div>
                    </div >
                </div >
            )}
        </>
    )
};

export default DebitoInmediato;