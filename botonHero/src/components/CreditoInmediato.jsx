import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import platform from 'platform';
import Layout from './Layout';
import {
    setPagoExitoso,
    setSelectedNacionalidad,
    setCedula,
    setNacionalidadCedula,
    setSelectedCodigoArea,
    setTelefono,
    setNumTelefono,
    setMonto,
    setToken,
    setError,
    setErrorPago,
    setSelectedBank,
    setBankOptions,
    setLoading,
    setSO,
    setHmac,
    setTransactionId
} from '../store/creditoInmediatoSlice';
import axios from 'axios';
import Lottie from "lottie-react";
import paySuccess from "../assets/LottieFiles/Animation - 1737322786287.json";
import loadingLottie from "../assets/LottieFiles/Animation - 1737389234353.json";
import formError from "../assets/LottieFiles/Animation - 1738074669174.json";
import CryptoJS from 'crypto-js';

const CreditoInmediato = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const {
        selectedNacionalidad,
        cedula,
        nacionalidadCedula,
        selectedCodigoArea,
        telefono,
        numTelefono,
        monto,
        concepto,
        token,
        error,
        selectedBank,
        bankOptions,
        loading,
        so,
        transactionId,
        pagoExitoso
    } = useSelector(state => state.creditoInmediato);

    const nacionalidad = ['V', 'E', 'J'];
    const codigosArea = ['0412', '0416', '0426', '0414', '0424'];
    const urlApiBoton = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR_PUBLICO;
    const urlApiMiBancoCreditoInmediato = import.meta.env.REACT_APP_URL_API_MIBANCO_CREDITOINMEDIATO;
    const urlApiMiBancoConsulta = import.meta.env.REACT_APP_URL_API_MIBANCO_CONSULTA;
    const tokenApi = import.meta.env.REACT_APP_TOKEN;
    const tokenCommerce = import.meta.env.REACT_APP_TOKEN_COMMERCE;
    const headers = { 'Authorization': `Bearer ${tokenApi}` };
    const [url] = useState(urlApiBoton);
    const [urlMibanco] = useState(urlApiMiBancoCreditoInmediato);
    const [urlMibancoConsulta] = useState(urlApiMiBancoConsulta);

    useEffect(() => {
        const soInfo = platform.os.family;
        //console.log(soInfo);

        dispatch(setSO(soInfo));
        dispatch(setTransactionId(id));

        const fetchBanksAndMonto = async () => {
            try {

                const transacciones = await axios.get(`${url}buscar_transacciones/${id}`, { headers });
                const response = await axios.get(`${url}bancos`, { headers });
                const filteredBanks = response.data.filter(bank => bank.nombre_banco === transacciones.data[0].banco);

                const selectedBankId = filteredBanks[0].codigo_banco;
                dispatch(setBankOptions(filteredBanks));
                dispatch(setSelectedBank(selectedBankId));

                const letra = transacciones.data[0].cedula.charAt(0);
                const numero = transacciones.data[0].cedula.slice(1);
                const filteredNacionalidad = nacionalidad.filter(nac => nac === letra);
                dispatch(setSelectedNacionalidad(filteredNacionalidad[0]));
                dispatch(setCedula(numero));
                dispatch(setNacionalidadCedula(letra + numero));

                const codigo = transacciones.data[0].telefono.slice(0, 4);
                const telefono = transacciones.data[0].telefono.slice(4);
                const filteredCodigo = codigosArea.filter(cod => cod === codigo);
                dispatch(setSelectedCodigoArea(filteredCodigo[0]));
                dispatch(setTelefono(telefono));
                dispatch(setNumTelefono(codigo + telefono));

                dispatch(setMonto(transacciones.data[0].monto));

            } catch (error) {
                console.error("Error obteniendo bancos:", error);
            }

        };

        fetchBanksAndMonto();
    }, [dispatch, id, url]);

    const handleBancoProcess = async (codigoBanco) => {
        try {
            const banco = await axios.get(`${url}buscar_banco?codigo=${codigoBanco}`, { headers });
            return banco.data;
        } catch (error) {
            dispatch(setError('Error id del banco'));
            return null;
        }
    };

    const handleClienteProcess = async (transactionId) => {

        try {
            const cliente_token = await axios.get(`${url}cliente_tokens?id=${transactionId}`, { headers });
            //console.log(cliente_token.data);
            return cliente_token.data;
        } catch (error) {
            //console.log(error);
            dispatch(setError('Error buscar cliente_token'));
            return null;
        }

    };

    const handleTransactionProcess = async (postData, banco, cliente_token, reference, transactionId) => {
        try {
            await axios.post(`${url}crear_transac`, {
                cliente_token_id: cliente_token.id,
                telefono: postData.Telefono,
                banco_id: banco.id,
                monto: postData.Monto,
                referencia: reference,
                descripcion: postData.Concepto,
                pasarela_id: 2,
                sitio_id: 1,
                sistema_operativo: so,
                id_transc: transactionId
            }, { headers });
            return true;
        } catch (error) {
            //console.log(error);
            dispatch(setError('Error guardar transaccion'));
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedBank) { dispatch(setError('Seleccione un Banco')); return; }
        if (!selectedNacionalidad || !cedula) { dispatch(setError('Indique Cédula o RIF')); return; }
        if (!selectedCodigoArea || !telefono) { dispatch(setError('Indique Teléfono')); return; }

        dispatch(setLoading(true));

        try {
            const postData = {
                Banco: selectedBank,
                Monto: monto,
                Telefono: numTelefono,
                Cedula: nacionalidadCedula,
                Concepto: concepto
            };

            dispatch(setError(''));

            const data1 = await handleCreditoInmediato(postData);
            let data2 = {}

            if (data1.code === 'AC00') {
                const maxRetries = 20;
                const delay = 2000;
                let attempts = 0;

                const retryConsulta = async (id) => {
                    while (attempts < maxRetries) {
                        attempts++;
                        try {
                            data2 = await handleConsulta(id);
                            if (data2.code !== 'AC00') {
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

                        const banco = await handleBancoProcess(postData.Banco);
                        if (!banco) return;

                        const cliente_token = await handleClienteProcess(transactionId);
                        if (!cliente_token) return;

                        await handleTransactionProcess(postData, banco, cliente_token, data2.reference, transactionId);
                        dispatch(setPagoExitoso(true));
                        setTimeout(() => {
                            window.location.href = '/vista';
                        }, 5000);
                    } catch (err) {
                        dispatch(setError("Ha ocurrido un error con el token"));
                        dispatch(setToken(null));
                    }
                } else {
                    dispatch(setError(''));
                    dispatch(setError(data2.message));
                    dispatch(setErrorPago(data2.code));
                    return;
                }

            } else {
                dispatch(setError(data1.message));
                return;
            }

        } catch (err) {
            dispatch(setError(err));
            console.error("Error-->:", err);
            dispatch(setToken(null));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleCreditoInmediato = async (postData) => {
        try {

            const { Banco, Cedula, Telefono, Monto, Concepto } = postData;
            const dataToHash = `${Banco}${Cedula}${Telefono}${Monto}`;
            const hash = CryptoJS.HmacSHA256(dataToHash, tokenCommerce);
            const hmacValue = hash.toString(CryptoJS.enc.Hex);
            dispatch(setHmac(hmacValue));

            const headersMiBanco = {
                'Content-Type': 'application/json',
                'Authorization': `${hmacValue}`,
                'Commerce': `${tokenCommerce}`
            };

            const miBanco = await axios.post(`${urlMibanco}`, postData, { headers: headersMiBanco });

            dispatch(setError(''));
            return miBanco.data;

        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
            dispatch(setError('Ocurrió un error al procesar la solicitud'));
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

            dispatch(setError(''));
            return miBancoConsulta.data;

        } catch (error) {
            console.error('Error al realizar la consulta:', error);
            dispatch(setError('Ocurrió un error al procesar la consulta'));
            return null;
        }
    };

    return (

        <div className="min-h-full ">
            <Layout />
            <div className="flex flex-1 w-screen h-full justify-center items-center pt-10">

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
                                        <h1 className="text-lg font-medium">Pago Crédito Inmediato</h1>
                                    </div>
                                )}

                                {pagoExitoso && (

                                    <div className="flex justify-center items-center">
                                        <div className="bg-green-100 border-t-4 border-green-500 rounded-b text-green-900 px-4 py-1 shadow-md w-60" role="alert">

                                            <div className="flex justify-center items-center text-center">
                                                <div className='justify-center items-center' >

                                                    <div className="flex flex-row justify-center items-center gap-1">
                                                        <Lottie animationData={paySuccess} loop={false} style={{ width: '20px', height: '20px' }} />
                                                        <p className="text-sm">¡Pago Realizado!</p>
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
                                        <select
                                            value={selectedBank}
                                            readOnly
                                            disabled
                                            className="text-lg bg-white pl-1 pr-1 w-56 mt-0 px-0.5 border-0 border-b-1 border-azulMove focus:ring-0 focus:border-naranjaMove"
                                            id="bank"
                                        >
                                            {bankOptions.map((bank) => (
                                                <option key={bank.codigo_banco} value={bank.codigo_banco}>
                                                    {`${bank.codigo_banco} - ${bank.nombre_banco}`}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">
                                        <div className="relative flex-1 flex items-center">
                                            <label htmlFor="nacionalidad" className="block">
                                                <select
                                                    value={selectedNacionalidad}
                                                    readOnly
                                                    disabled
                                                    className="text-lg bg-white pl-1 pr-1 w-20 px-0.5 border-0 border-b-1 border-azulMove focus:ring-0 focus:border-naranjaMove"
                                                    id="nacionalidad"
                                                >
                                                    {nacionalidad.map((nacio, index) => (
                                                        <option key={index} value={nacio} disabled className='text-center'>{nacio}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>

                                        <div className="relative flex-1 flex items-center">
                                            <input
                                                id="cedula"
                                                type="number"
                                                value={cedula}
                                                placeholder="Cédula/RIF."
                                                disabled
                                                onInput={(e) => {
                                                    const maxLength = selectedNacionalidad === 'J' ? 9 : 8;
                                                    e.target.value = e.target.value.slice(0, maxLength);
                                                }}
                                                className="text-lg w-36 peer border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove"
                                            />
                                            <label
                                                htmlFor="cedula"
                                                className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                            >
                                                Cédula/RIF.
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">
                                        <div className="relative flex-1 flex items-center">
                                            <label htmlFor="codigosArea" className="block">
                                                <select
                                                    value={selectedCodigoArea}
                                                    readOnly
                                                    disabled
                                                    className="text-lg bg-white pl-1 pr-1 w-20 px-0.5 border-0 border-b-1 border-azulMove focus:ring-0 focus:border-naranjaMove"
                                                    id="codigosArea"
                                                >
                                                    {codigosArea.map((codigoArea, index) => (
                                                        <option key={index} value={codigoArea} disabled className="text-center">
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

                                                disabled
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
                                        <input
                                            id="monto"
                                            type="text"
                                            value={`Bs.${monto}`}

                                            disabled
                                            className="text-lg w-56 peer h-10 border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove"
                                        />
                                        <label
                                            htmlFor="monto"
                                            className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                        >
                                            Monto
                                        </label>
                                    </div>

                                    {/* <div className="mt-8 relative flex flex-row pl-1 pr-1">
                    <input id="concepto" type="text"
                        value={concepto}
                        onChange={handleChangeConcepto}
                        readOnly className="w-56 peer h-10 border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove" />
                    <label htmlFor="concepto" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Concepto</label>
                </div> */}

                                    {(!pagoExitoso) && (
                                        <div className='pb-2'>
                                            <button type="submit" className="mt-10 px-4 py-2 rounded-xl bg-azulMove text-white font-semibold text-center block w-full cursor-pointer">
                                                ENVIAR VUELTO
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
        </div>


    )
};

export default CreditoInmediato;