import React, { useState } from 'react';
import axios from 'axios';
import Layout from './Layout';
import Lottie from "lottie-react";
import paySuccess from "../assets/LottieFiles/Animation - 1737322786287.json";
import loadingLottie from "../assets/LottieFiles/Animation - 1737389234353.json";
import formError from "../assets/LottieFiles/Animation - 1738074669174.json";

const CrearSitio = () => {

    const [error, setError] = useState(null);
    const [exito, setExito] = useState(null);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [identificador, setIdentificador] = useState('');

    const url = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR_PUBLICO;
    const headers = { 'Authorization': `Bearer ${import.meta.env.REACT_APP_TOKEN}` };

    const handleChangeNombre = (e) => {
        setError('');
        const value = e.target.value;
        setNombre(value);
    };

    const handleChangeDescripcion = (e) => {
        setError('');
        const value = e.target.value;
        setDescripcion(value);
    };

    const handleChangeIdentificador = (e) => {
        setError('');
        const value = e.target.value;
        const onlyNumbers = value.replace(/[^0-9]/g, '');
        setIdentificador(onlyNumbers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombre) { setError(`Ingrese el nombre del sitio`); return; }
        if (!descripcion) { setError(`Ingrese la descripción del sitio`); return; }
        if (!identificador) { setError(`Ingrese el ID del sitio`); return; }

        const postData = { nombre: nombre, descripcion: descripcion, identificador: identificador };

        try {
            await axios.post(`${url}crear_sitio`, postData, { headers });
            setExito(true);
        } catch (err) {
            setError('Error al crear el sitio. Intente nuevamente.');
            console.error(err);
        }
    }

    return (
        <div className="min-h-full ">
            <Layout />
            <div className="flex flex-1 w-screen h-full justify-center items-center pt-10">

                <div className="w-64 rounded-3xl mx-auto overflow-hidden"> {/* shadow-xl */}
                    <div className="bg-white pb-0 rounded-tr-4xl">
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
                                    <h1 className="text-lg font-medium">Crear Sitio</h1>
                                </div>
                            )}

                            {exito && (
                                <div className="flex justify-center items-center">
                                    <div className="bg-green-100 border-t-4 border-green-500 rounded-b text-green-900 px-4 py-1 shadow-md w-60" role="alert">
                                        <div className="flex justify-center items-center text-center">
                                            <div className='justify-center items-center'>
                                                <div className="flex flex-row justify-center items-center gap-1">
                                                    <Lottie animationData={paySuccess} loop={false} style={{ width: '20px', height: '20px' }} />
                                                    <p className="text-sm">¡Sitio Creado!</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>

                        <div className="flex flex-1 h-full justify-center items-center">
                            <form className="mt-1" onSubmit={handleSubmit}>
                                <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">
                                    <div className="relative flex-1 flex items-center">
                                        <input
                                            id="nombre"
                                            type="text"
                                            value={nombre}
                                            placeholder=""
                                            onChange={handleChangeNombre}
                                            className="text-lg w-60 peer border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove"
                                        />
                                        <label
                                            htmlFor="nombre"
                                            className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                        >
                                            Nombre del Sitio
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">
                                    <div className="relative flex-1 flex items-center">
                                        <input
                                            id="descripcion"
                                            type="text"
                                            value={descripcion}
                                            placeholder=""
                                            onChange={handleChangeDescripcion}
                                            className="text-lg w-60 peer border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove"
                                        />
                                        <label
                                            htmlFor="descripcion"
                                            className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                        >
                                            Descripción del Sitio
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">
                                    <div className="relative flex-1 flex items-center">
                                        <input
                                            id="identificador"
                                            type="text"
                                            value={identificador}
                                            placeholder=""
                                            onChange={handleChangeIdentificador}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.slice(0, 8);
                                            }}
                                            className="text-lg w-60 peer border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove"
                                        />
                                        <label
                                            htmlFor="identificador"
                                            className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                        >
                                            Identificador del Sitio
                                        </label>
                                    </div>
                                </div>

                                <div className='pb-2'>
                                    <button type="submit" className="mt-10 px-4 py-2 rounded-xl bg-azulMove text-white font-semibold text-center block w-full cursor-pointer">
                                        GUARDAR
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CrearSitio
