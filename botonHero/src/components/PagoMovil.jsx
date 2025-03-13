import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Lottie from "lottie-react";
import formError from "../assets/LottieFiles/Animation - 1738074669174.json";
import ErrorApiR4 from './ErrorApiR4';
import Success from './Success';
import { HeadersR4, obtenerFechaValor } from './utils';
import Loading from './Loading';

const PagoMovil = () => {

    // URLs desde variables de entorno
    const url = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR_PUBLICO;
    const headers = { 'Authorization': `Bearer ${import.meta.env.REACT_APP_TOKEN}` };

    // Constantes
    const nacionalidad = ['V', 'E', 'J'];
    const codigosArea = ['0412', '0416', '0426', '0414', '0424'];

    const [errorApiR4, setErrorApiR4] = useState('');
    const [loading, setLoading] = useState('');
    const [error, setError] = useState('');
    const [token, setToken] = useState('');
    const [selectedCodigoArea, setSelectedCodigoArea] = useState('');
    const [telefono, setTelefono] = useState('');
    const [numTelefono, setNumTelefono] = useState('');
    const [referencia, setReferencia] = useState('');
    const [mensajeApis, setMensajeApis] = useState('');

    const handleSelectChangeCodigoArea = (e) => {
        //console.log(e.target.value);
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

    const handleChangeReferencia = (e) => {
        setError('');
        const value = e.target.value;
        // Permitir solo números (0-9)
        const onlyNumbers = value.replace(/[^0-9]/g, '');
        setReferencia(onlyNumbers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let notificacion = {};
        const maxRetries = 20;
        const delay = 1000;
        let attempts = 0;

        const retryConsulta = async () => {
            while (attempts < maxRetries) {
                attempts++;
                console.log(`Attempt number: ${attempts}`); // Log the number of attempts
                notificacion = await axios.get(`${url}buscar_notificacion?numTelefono=${numTelefono}&referencia=${referencia}`, { headers });

                if (notificacion.data) {
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        };

        await retryConsulta();

        if (attempts === maxRetries) { setError('No se ha podido validar el Pago'); return; }

        if (notificacion.data) {
            console.log(notificacion.data);
        }

        return;
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

                            <div className="pt-2 flex flex-1 h-full justify-center items-center">
                                <form className="mt-1" onSubmit={handleSubmit}>

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
                                                    const maxLength = 9;
                                                    e.target.value = e.target.value.slice(0, maxLength);
                                                }}
                                                className="text-lg w-60 peer border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove"
                                            />
                                            <label
                                                htmlFor="referencia"
                                                className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                            >
                                                Referencia
                                            </label>
                                        </div>
                                    </div>

                                    <div className='pb-2'>
                                        <button type="submit" className="mt-10 px-4 py-2 rounded-xl bg-azulMove text-white font-sans font-semibold text-sm text-center block w-full cursor-pointer">
                                            NOTIFICAR PAGO
                                        </button>
                                    </div>

                                </form>
                            </div>

                        </div>
                    </div>
                </div >
            )}
        </>
    );
};

export default PagoMovil
