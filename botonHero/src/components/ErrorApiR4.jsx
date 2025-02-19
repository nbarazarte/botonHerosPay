import React from 'react'
import Lottie from "lottie-react";
import bankError from "../assets/LottieFiles/x bonita.json";

const ErrorApiR4 = ({
    mensajeApis,
    errorApiR4
}) => {
    return (
        <>
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

                                            <div className='flex flex-col justify-center items-center text-black gap-1'>
                                                <div className="flex size-12 items-center justify-center rounded-full bg-red-400 ">
                                                    <Lottie animationData={bankError} loop={true} style={{ width: '100%', height: '100%' }} />
                                                </div>
                                                <p className='text-lg'>{mensajeApis}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-md text-black">
                                                {errorApiR4}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="bg-gray-50 py-3 flex flex-row-reverse px-6 justify-center items-center">
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="inline-flex  justify-center rounded-md bg-naranjaMove px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-orange-300 sm:ml-3 sm:w-auto"
                                >
                                    Refrescar Página
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default ErrorApiR4