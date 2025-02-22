import { useParams } from 'react-router-dom';
import platform from 'platform';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Lottie from "lottie-react";
import loadingLottie from "../assets/LottieFiles/Animation - 1737389234353.json";
import formError from "../assets/LottieFiles/Animation - 1738074669174.json";
import ErrorApiR4 from './ErrorApiR4';
import Success from './Success';
import Form1 from './Form1';
import Form2 from './Form2';
import HeadersR4 from './HeadersR4';
import {
    setSO,
    setMensajeApis,
    setIdentificadorAp,
    setError,
    setErrorApiR4,
    setBankOptions,
    setMonto,
    setMsjOtp,
    setMsjOtp2,
    setDataForm,
    setShowOtpForm1,
    setShowOtpForm2,
    setTimeLeft
} from '../store/debitoInmediatoSlice';

const DebitoInmediato = () => {
    const dispatch = useDispatch();
    const { idSitio, plan, montoPlan } = useParams();

    // Seleccionar estados desde Redux
    const {
        so,
        mensajeApis,
        errorApiR4,
        loading,
        loadingBankWait,
        error,
        token,
        bankOptions,
        showOtpForm1,
        showOtpForm2,
    } = useSelector((state) => state.debitoInmediato);

    // URLs desde variables de entorno
    const url = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR_PUBLICO;
    const urlMibanco2 = import.meta.env.REACT_APP_URL_API_MIBANCO_DEBITOINMEDIATO;
    const urlMibanco3 = import.meta.env.REACT_APP_URL_API_MIBANCO_GENERAROTP;
    const urlMibancoConsulta = import.meta.env.REACT_APP_URL_API_MIBANCO_CONSULTA;
    const urlMiBancoBcv = import.meta.env.REACT_APP_URL_API_MIBANCO_BCV;
    const tokenCommerce = import.meta.env.REACT_APP_TOKEN_COMMERCE;
    const headers = { 'Authorization': `Bearer ${import.meta.env.REACT_APP_TOKEN}` };

    useEffect(() => {
        const soInfo = platform.os.family;
        dispatch(setSO(soInfo));

        const mensajeOtp = localStorage.getItem('mensajeOtp');
        const mensajeOtp2 = localStorage.getItem('mensajeOtp2');
        const dataFormulario = JSON.parse(localStorage.getItem('dataFormulario'));
        const formulario1 = localStorage.getItem('formulario1');
        const formulario2 = localStorage.getItem('formulario2');

        if (mensajeOtp != null) {
            dispatch(setMsjOtp(mensajeOtp));
            dispatch(setMsjOtp2(mensajeOtp2));
            dispatch(setDataForm(dataFormulario));
            dispatch(setShowOtpForm1(formulario1));
            dispatch(setShowOtpForm2(formulario2));
            dispatch(setTimeLeft(0));
        }

        const fetchBanksAndMonto = async () => {
            try {
                const sitio = await axios.get(`${url}sitios?idAp=${idSitio}`, { headers });
                dispatch(setIdentificadorAp(sitio.data.id));
                const bancos = await axios.get(`${url}bancosDebitoInmediato`, { headers });
                dispatch(setBankOptions(bancos.data));

                const fechaValor = obtenerFechaValor();
                const dataToHash = `${fechaValor}USD`;
                const headersMiBanco = HeadersR4({ dataToHash, tokenCommerce });
                const postData = { Moneda: "USD", Fechavalor: fechaValor };
                const tasaBcv = await axios.post(`${urlMiBancoBcv}`, postData, { headers: headersMiBanco });
                dispatch(setMonto((Number(montoPlan) * tasaBcv.data.tipocambio).toFixed(2)));

            } catch (error) {

                const API = error.config.url.includes('r4conecta') ? "R4" : "Heros";
                let mensaje = '';
                let mensajeApis = '';

                if (API == 'Heros') {
                    mensajeApis = 'Falla de conexión con el Servidor';
                    mensaje = 'En estos momentos, el servidor no está disponible. Por favor, intente más tarde.';
                } else {
                    mensajeApis = 'Falla de conexión con el Banco';
                    mensaje = 'En estos momentos, la plataforma bancaria no está disponible. Por favor, intente más tarde.';
                }

                dispatch(setMensajeApis(mensajeApis));
                dispatch(setError(mensaje));
                dispatch(setErrorApiR4(mensaje));
                return null;
            }
        };

        fetchBanksAndMonto();
    }, [dispatch, idSitio, montoPlan, url, urlMiBancoBcv]);

    const obtenerFechaValor = () => {
        const fechaActual = new Date();
        const año = fechaActual.getFullYear();
        const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaActual.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
    }

    return (
        <>
            {errorApiR4 ? (
                <ErrorApiR4 mensajeApis={mensajeApis} errorApiR4={errorApiR4} />
            ) : (
                <div className="flex flex-1 w-screen h-screen justify-center items-start justify-items-center">
                    <div className="w-64 rounded-3xl mx-auto overflow-hidden">
                        <div className="bg-white pb-0 rounded-tr-4xl">
                            {loading ? (
                                <div className={`flex justify-center items-center ${loadingBankWait ? 'pt-24' : ''}`}>
                                    <Lottie animationData={loadingLottie} loop={true} style={{ width: '100px', height: '100px' }} />
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-center items-center pt-3">
                                        <div className={`flex flex-row justify-center items-center gap-1 ${error ? 'bg-orange-50 border-t-4 border-naranjaMove rounded-b text-black px-4 py-3 shadow-md w-60' : 'text-black px-4 py-3'}`}>
                                            {error ? (
                                                <>
                                                    <Lottie animationData={formError} loop={true} style={{ width: '40px', height: '40px' }} />
                                                    <p className="text-sm">{error}</p>
                                                </>)
                                                : (<h1 className="text-lg font-medium">Pago Débito Inmediato</h1>)}
                                        </div>
                                    </div>

                                    {token && (<Success />)}
                                </>
                            )}

                            {!bankOptions.length == 0 ? (
                                <>
                                    {showOtpForm1 === true && (
                                        <Form1
                                            so={so}
                                            url={url}
                                            urlMibanco3={urlMibanco3}
                                            tokenCommerce={tokenCommerce}
                                            headers={headers}
                                        />
                                    )}

                                    {showOtpForm2 && (
                                        <Form2
                                            so={so}
                                            tokenCommerce={tokenCommerce}
                                            urlMibanco2={urlMibanco2}
                                            urlMibancoConsulta={urlMibancoConsulta}
                                            url={url}
                                            headers={headers}
                                        />
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-1 h-full justify-center items-center">
                                    <Lottie animationData={loadingLottie} loop={false} style={{ width: '100px', height: '100px' }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DebitoInmediato;
