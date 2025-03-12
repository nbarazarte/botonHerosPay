import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Lottie from "lottie-react";
import formError from "../assets/LottieFiles/Animation - 1738074669174.json";
import ErrorApiR4 from './ErrorApiR4';
import Success from './Success';
import { HeadersR4, obtenerFechaValor } from './utils';
import Loading from './Loading';
import { useDispatch, useSelector } from 'react-redux';
import {
    setSelectedCodigoArea,
    setTelefono,
    setNumTelefono,
    setMonto,
    setError,
    setReferencia,
} from '../store/pagoMovilSlice';

const PagoMovil = () => {
    const dispatch = useDispatch();
    // URLs desde variables de entorno
    const url = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR_PUBLICO;
    const urlMibanco2 = import.meta.env.REACT_APP_URL_API_MIBANCO_DEBITOINMEDIATO;
    const urlMibanco3 = import.meta.env.REACT_APP_URL_API_MIBANCO_GENERAROTP;
    const urlMibancoConsulta = import.meta.env.REACT_APP_URL_API_MIBANCO_CONSULTA;
    const urlMiBancoBcv = import.meta.env.REACT_APP_URL_API_MIBANCO_BCV;
    const tokenCommerce = import.meta.env.REACT_APP_TOKEN_COMMERCE;
    const headers = { 'Authorization': `Bearer ${import.meta.env.REACT_APP_TOKEN}` };



    // Constantes
    const nacionalidad = ['V', 'E', 'J'];
    const codigosArea = ['0412', '0416', '0426', '0414', '0424'];

    // Seleccionar estados desde Redux
    const {
        token,
        selectedCodigoArea,
        telefono,
        referencia,
        monto,
        error,
        errorApiR4,
        loading
    } = useSelector(state => state.debitoInmediato);

    const handleSelectChangeCodigoArea = (e) => {
        dispatch(setError(''));
        dispatch(setSelectedCodigoArea(e.target.value));
        dispatch(setNumTelefono(e.target.value + telefono));
    };

    const handleChangeTelefono = (e) => {
        dispatch(setError(''));
        const value = e.target.value;
        // Permitir solo números (0-9)
        const onlyNumbers = value.replace(/[^0-9]/g, '');
        dispatch(setTelefono(onlyNumbers));
        dispatch(setNumTelefono(selectedCodigoArea + onlyNumbers));
    };

    const handleChangeReferencia = (e) => {
        dispatch(setError(''));
        const value = e.target.value;
        // Permitir solo números (0-9)
        const onlyNumbers = value.replace(/[^0-9]/g, '');
        dispatch(setReferencia(onlyNumbers));
    };

    return (
        <>
            {errorApiR4 ? (
                <ErrorApiR4 mensajeApis={mensajeApis} errorApiR4={errorApiR4} />
            ) : (
                <div className="flex flex-1 w-screen h-screen justify-center items-start justify-items-center">
                    <div className="w-64 rounded-3xl mx-auto overflow-hidden">
                        <div className="bg-white pb-0 rounded-tr-4xl">

                            {loading ? (
                                <Loading />
                            ) : (
                                <>
                                    <div className="flex justify-center items-center pt-3">
                                        <div className={`flex flex-row justify-center items-center gap-1 ${error ? 'bg-orange-50 border-t-4 border-naranjaMove rounded-b text-black px-4 py-3 shadow-md w-60' : 'text-black px-4 py-3'}`}>
                                            {error ? (
                                                <>
                                                    <Lottie animationData={formError} loop={true} style={{ width: '40px', height: '40px' }} />
                                                    <p className="text-sm">{error}</p>
                                                </>)
                                                : (<h1 className="text-lg font-medium">Pago Móvil</h1>)}
                                        </div>
                                    </div>
                                    {token && (<Success />)}
                                </>
                            )}


                            <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">
                                <div className="relative flex-1 flex items-center">
                                    <label htmlFor="codigosArea" className="block">
                                        <select
                                            value={selectedCodigoArea}
                                            onChange={handleSelectChangeCodigoArea}
                                            className="text-lg bg-white pl-1 pr-1 w-20 px-0.5 border-0 border-b-1 border-azulMove focus:ring-0 focus:border-naranjaMove"
                                            id="codigosArea"
                                        >
                                            <option value="" className="text-center">04**</option>
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

                            <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">


                                <div className="relative flex-1 flex items-center">
                                    <input
                                        id="referencia"
                                        type="number"
                                        value={referencia}
                                        placeholder="Referencia"
                                        onChange={handleChangeReferencia}
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

                        </div>
                    </div>
                </div >
            )}
        </>
    );
};

export default PagoMovil