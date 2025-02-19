import React from 'react'
import FormFields from './FormFields';
import Lottie from "lottie-react";
import bankWait from "../assets/LottieFiles/Animation - 1738285370531.json";
import sms from "../assets/LottieFiles/Animation - 1738195342163.json";
import axios from 'axios';
import CryptoJS from 'crypto-js';

export const Form2 = ({
    pagoExitoso,
    loading,
    vieneForm1,
    so,
    msjOtp,
    msjOtp2,
    timeLeft,
    isVisible,
    otp,
    selectedBank,
    bankOptions,
    selectedNacionalidad,
    nacionalidad,
    cedula,
    setCedula,
    selectedCodigoArea,
    codigosArea,
    telefono,
    setTelefono,
    monto,
    setMonto,
    setError,
    setSelectedBank,
    setSelectedNacionalidad,
    setNacionalidadCedula,
    setSelectedCodigoArea,
    setNumTelefono,
    setConcepto,
    error,
    setErrorPago,
    setIsVisible,
    setOtp,
    setLoading,
    setLoadingBankWait,
    dataForm,
    setPagoExitoso,
    setErrorApiR4,
    tokenCommerce,
    urlMibanco2,
    urlMibancoConsulta,
    url,
    headers,
    identificadorAp,
    setNumeroFactura,
    setToken

}) => {

    const handleChangeOtp = (e) => {
        setError('');
        setErrorPago('');
        setOtp(e.target.value);
        setIsVisible(true);
    };

    const RefreshButton = () => (
        <a onClick={() => {
            handledestruir();
            window.location.reload();
        }} className="  text-blue-700 font-sans font-semibold text-xl text-center block  cursor-pointer">
            Ir al inicio
        </a>
    );

    const handledestruir = () => { localStorage.clear(); }

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
                        sistema_operativo: so
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

    const handleDebitoInmediato = async (postData) => {

        try {
            const { Banco, Cedula, Telefono, Monto, Concepto, Otp } = postData;
            const dataToHash = `${Banco}${Cedula}${Telefono}${Monto}${Otp}`;
            const headersMiBanco = headersR4(dataToHash)
            const miBanco = await axios.post(`${urlMibanco2}`, postData, { headers: headersMiBanco });
            return miBanco.data;

        } catch (error) {
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
            setError('Ocurrió un error al procesar la consulta');
            setErrorApiR4('En estos momentos, la plataforma bancaria no está disponible. Por favor, intente más tarde.');
            return null;
        }
    };

    return (
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
                                {(vieneForm1 === true || so !== 'iOS') && (
                                    <>
                                        <p className='text-sm text-center font-semibold'>{msjOtp}</p>
                                        <p className='text-sm text-center'>
                                            {!msjOtp2 ? (<> Si no recibe el mensaje, verifique sus datos ingresados, e intente nuevamente en {timeLeft} segundos. </>) : (msjOtp2)}
                                        </p>
                                        {(timeLeft == 0 || error) && <RefreshButton />}
                                        <div className="mt-8 relative flex flex-row pl-1 pr-1 justify-center items-center">
                                            <Lottie animationData={sms} loop={true} style={{ width: '150px', height: '150px' }} />
                                        </div>
                                    </>
                                )}

                                {(vieneForm1 === false && so === 'iOS') &&

                                    <FormFields
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
                                    />
                                }
                            </>
                        )}

                        <div className='pb-2'>

                            {isVisible && (
                                <>
                                    <div className="mt-8 relative flex flex-row pl-1 pr-1">
                                        <input id="otp" type="number"
                                            value={otp}
                                            placeholder=""
                                            onChange={handleChangeOtp}
                                            onInput={(e) => { e.target.value = e.target.value.slice(0, 10) }}
                                            className="w-56 peer h-10 border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove" />
                                        <label htmlFor="otp" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Ingrese el código recibido</label>
                                    </div>

                                    <button
                                        type="submit"
                                        className="mt-10 px-4 py-2 rounded-xl bg-naranjaMove text-white font-sans font-semibold text-sm text-center block w-full cursor-pointer"
                                    >
                                        CONFIRMAR PAGO
                                    </button>

                                    <div className='pt-5'>
                                        {(vieneForm1 === false && so === 'iOS') && <RefreshButton />}
                                    </div>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </>
    )
}

export default Form2