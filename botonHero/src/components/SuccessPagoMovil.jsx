import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Lottie from "lottie-react";
import copy from "copy-to-clipboard";
import paySuccess from "../assets/LottieFiles/Animation - 1737322786287.json";
import wifi from "../assets/LottieFiles/Animation - 1737384712836.json";
import {
    setCopied,
    setTextoBoton
} from '../store/pagoMovilSlice';

const SuccessPagoMovil = () => {
    const dispatch = useDispatch();

    // Select states from Redux
    const {
        numeroFactura,
        token,
        textoBoton
    } = useSelector(state => state.pagoMovil);

    const handleCopy = () => {
        copy(token.token, {
            debug: true,
            message: "Press #{key} to copy"
        });
        dispatch(setCopied(true));
        dispatch(setTextoBoton('¡Token Copiado!'));
        handledestruir();
        setTimeout(() => dispatch(setCopied(false)), 3000); // Reset after 3 seconds
    };

    const handledestruir = () => {
        localStorage.clear();
    };

    return (
        <div className="relative z-10">
            <div
                className="fixed inset-0 bg-gray-300 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                    <div
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
                                className="inline-flex justify-center rounded-md bg-naranjaMove px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-orange-300 sm:ml-3 sm:w-auto"
                            >
                                {textoBoton}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessPagoMovil;
