import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormFields from './FormFields';
import Lottie from "lottie-react";
import bankWait from "../assets/LottieFiles/Animation - 1738285370531.json";
import sms from "../assets/LottieFiles/Animation - 1738195342163.json";
import axios from 'axios';
import { HeadersR4 } from './utils';
import {
    setError,
    setErrorPago,
    setIsVisible,
    setOtp,
    setLoading,
    setLoadingBankWait,
    setPagoExitoso,
    setErrorApiR4,
    setNumeroFactura,
    setToken
} from '../store/debitoInmediatoSlice';

const Form2 = ({ url, urlMibanco2, urlMibancoConsulta, tokenCommerce, headers }) => {
    const dispatch = useDispatch();

    // Seleccionar estados desde Redux
    const {
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
        selectedNacionalidad,
        cedula,
        selectedCodigoArea,
        telefono,
        monto,
        numTelefono,
        nacionalidadCedula,
        concepto,
        error,
        dataForm,
        identificadorAp
    } = useSelector(state => state.debitoInmediato);

    const handleChangeOtp = (e) => {
        dispatch(setError(''));
        dispatch(setErrorPago(''));
        dispatch(setOtp(e.target.value));
        dispatch(setIsVisible(true));
    };

    const RefreshButton = () => (
        <a onClick={() => {
            localStorage.clear();
            window.location.reload();
        }} className="text-blue-700 font-sans font-semibold text-xl text-center block cursor-pointer">
            Ir al inicio
        </a>
    );

    const handleSubmitConOtp = async (e) => {
        e.preventDefault();

        try {
            if (!otp) {
                dispatch(setError('Indique el OTP recibido'));
                dispatch(setIsVisible(true));
                return;
            }
            dispatch(setIsVisible(false));
            dispatch(setLoading(true));
            dispatch(setLoadingBankWait(true));

            let postData = {};

            if (so !== 'iOS') {
                const { Banco, Cedula, Telefono, Monto, Concepto } = dataForm;
                postData = { Banco, Monto, Telefono, Cedula, Concepto, Otp: otp };
            } else {
                const token = await axios.get(`${url}buscar_token`, { headers });
                if (!token.data) { dispatch(setError('No hay tokens disponibles, intente luego.')); return; }
                if (!selectedBank) { dispatch(setError('Seleccione un Banco')); return; }
                if (!selectedNacionalidad || !cedula) { dispatch(setError('Indique Cédula o RIF')); return; }
                if (!selectedCodigoArea || !telefono) { dispatch(setError('Indique Teléfono')); return; }

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

            let data2 = {};
            if (data1.code === 'AC00') {
                const maxRetries = 20;
                const delay = 1000;
                let attempts = 0;

                const retryConsulta = async (id) => {
                    while (attempts < maxRetries) {
                        attempts++;
                        data2 = await handleConsulta(id);
                        if (data2.code !== 'AC00') {
                            break;
                        }
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                };

                await retryConsulta(data1.id);

                if (data2.code === 'ACCP') {
                    const token = await axios.get(`${url}buscar_token`, { headers });
                    if (!token.data) {
                        dispatch(setError('No hay tokens disponibles'));
                        return;
                    }
                    dispatch(setToken(token.data));

                    await axios.put(`${url}${token.data.id}`, { used: true }, { headers });

                    const banco = await axios.get(`${url}buscar_banco?codigo=${postData.Banco}`, { headers });

                    let cliente = await axios.get(`${url}buscar_cliente?cedula=${postData.Cedula}`, { headers });

                    if (!cliente.data.id) {
                        cliente = await axios.post(`${url}crear_cliente`, { cedula: postData.Cedula }, { headers });
                    }

                    const cliente_token = await axios.post(`${url}cliente_tokens`, {
                        cliente_id: cliente.data.id,
                        token_id: token.data.id
                    }, { headers });

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

                    dispatch(setNumeroFactura(transac.data.id.toString().padStart(5, '0')));
                    dispatch(setPagoExitoso(true));
                } else {
                    dispatch(setError(data2.message));
                    dispatch(setErrorPago(data2.code));
                    return;
                }
            } else {
                dispatch(setError('La longitud del campo OTP recibida es incorrecta'));
                dispatch(setIsVisible(true));
                return;
            }
        } catch (err) {
            dispatch(setError(err));
            dispatch(setToken(null));
        } finally {
            dispatch(setLoading(false));
            dispatch(setLoadingBankWait(false));
            dispatch(setIsVisible(true));
        }
    };

    const handleDebitoInmediato = async (postData) => {
        try {
            const { Banco, Cedula, Telefono, Monto, Otp } = postData;
            const dataToHash = `${Banco}${Cedula}${Telefono}${Monto}${Otp}`;
            const headersMiBanco = HeadersR4({ dataToHash, tokenCommerce });
            const miBanco = await axios.post(`${urlMibanco2}`, postData, { headers: headersMiBanco });
            return miBanco.data;
        } catch (error) {
            dispatch(setError('Ocurrió un error al procesar la solicitud'));
            dispatch(setErrorApiR4('En estos momentos, la plataforma bancaria no está disponible. Por favor, intente más tarde.'));
            return null;
        }
    };

    const handleConsulta = async (id) => {
        try {
            const dataToHash = `${id}`;
            const headersMiBanco = HeadersR4({ dataToHash, tokenCommerce });
            const data = { id: `${id}` };
            const miBancoConsulta = await axios.post(`${urlMibancoConsulta}`, data, { headers: headersMiBanco });
            return miBancoConsulta.data;
        } catch (error) {
            dispatch(setError('Ocurrió un error al procesar la consulta'));
            dispatch(setErrorApiR4('En estos momentos, la plataforma bancaria no está disponible. Por favor, intente más tarde.'));
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
                                        {(timeLeft === 0 || error) && <RefreshButton />}
                                        <div className="mt-8 relative flex flex-row pl-1 pr-1 justify-center items-center">
                                            <Lottie animationData={sms} loop={true} style={{ width: '150px', height: '150px' }} />
                                        </div>
                                    </>
                                )}

                                {(vieneForm1 === false && so === 'iOS') && <FormFields />}
                            </>
                        )}

                        <div className='pb-2'>
                            {isVisible && (
                                <>
                                    <div className="mt-8 relative flex flex-row pl-1 pr-1">
                                        <input
                                            id="otp"
                                            type="number"
                                            value={otp}
                                            placeholder=""
                                            onChange={handleChangeOtp}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.slice(0, 10);
                                            }}
                                            className="w-56 peer h-10 border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove"
                                        />
                                        <label
                                            htmlFor="otp"
                                            className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                        >
                                            Ingrese el código recibido
                                        </label>
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
    );
};

export default Form2;
