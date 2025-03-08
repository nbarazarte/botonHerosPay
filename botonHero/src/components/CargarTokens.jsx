import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout';
import Lottie from "lottie-react";
import paySuccess from "../assets/LottieFiles/Animation - 1737322786287.json";
import formError from "../assets/LottieFiles/Animation - 1738074669174.json";

const CargarTokens = () => {

    const [error, setError] = useState(null);
    const [exito, setExito] = useState(null);
    const [plan, setPlan] = useState('');
    const [sitios, setSitios] = useState([]);
    const [tokens, setTokens] = useState('');
    const [selectedSitio, setSelectedSitio] = useState('');

    const url = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR_PUBLICO;
    const headers = { 'Authorization': `Bearer ${import.meta.env.REACT_APP_TOKEN}` };

    useEffect(() => {

        const fetchSitios = async () => {

            try {
                const response = await axios.get(`${url}todos_sitios`, { headers });
                setSitios(response.data);
            } catch (error) {
                setError('Error al cargar el sitio. Intente nuevamente.');
            }
        }

        fetchSitios();
    }, [])

    const handleSelectChange = (event) => {
        //console.log(event.target.value);
        setSelectedSitio(event.target.value);
        setError('');
    };

    const handleChangePlan = (e) => {
        setError('');
        //console.log(e.target.value);
        const value = e.target.value;
        setPlan(value);
    };

    const handleChangeTokens = (e) => {
        setError('');
        //console.log(e.target.value);
        const value = e.target.value;
        setTokens(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSitio) { setError(`Seleccione el nombre del sitio`); return; }
        if (!plan) { setError(`Ingrese el nombre del plan`); return; }
        if (!tokens) { setError(`Ingrese la lista de tokens`); return; }

        //const postData = { token: tokens, plan: plan, id_sitio: selectedSitio };
        const tokensArray = tokens.split(',').map(token => token.trim());

        //console.log(postData);
        //console.log(tokensArray);            
        //return;

        try {

            for (const token of tokensArray) {
                const postData = { token: token, plan: plan, id_sitio: selectedSitio };
                //console.log(postData);
                await axios.post(`${url}cargar_tokens`, postData, { headers });
            }

            setExito(true);
            setTimeout(() => {
                window.location.reload();
            }, 5000);

        } catch (err) {
            setError('Error al cargar los tokens.');
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
                                    <h1 className="text-lg font-medium">Cargar Tokens</h1>
                                </div>
                            )}

                            {exito && (
                                <div className="flex justify-center items-center">
                                    <div className="bg-green-100 border-t-4 border-green-500 rounded-b text-green-900 px-4 py-1 shadow-md w-60" role="alert">
                                        <div className="flex justify-center items-center text-center">
                                            <div className='justify-center items-center'>
                                                <div className="flex flex-row justify-center items-center gap-1">
                                                    <Lottie animationData={paySuccess} loop={false} style={{ width: '20px', height: '20px' }} />
                                                    <p className="text-sm">¡Tokens cargados con éxito!</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>

                        <div className="flex flex-1 h-full justify-center items-center">
                            <form className="mt-1" onSubmit={handleSubmit}>


                                <label htmlFor="bank" className="block">
                                    <select
                                        value={selectedSitio}
                                        onChange={handleSelectChange}
                                        className="text-lg bg-white pl-1 pr-1 w-56 mt-0 px-0.5 border-0 border-b-1 border-azulMove focus:ring-0 focus:border-naranjaMove"
                                        id="bank"
                                    >
                                        <option value="" disabled className='text-center'>Seleccione el Sitio</option>
                                        {sitios.map((sitio) => (
                                            <option key={sitio.nombre} value={sitio.id}>
                                                {`${sitio.nombre}`}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">
                                    <div className="relative flex-1 flex items-center">
                                        <input
                                            id="plan"
                                            type="text"
                                            value={plan}
                                            placeholder=""
                                            onChange={handleChangePlan}
                                            className="text-lg w-60 peer border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove"
                                        />
                                        <label
                                            htmlFor="plan"
                                            className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                        >
                                            Nombre del Plan
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">
                                    <div className="relative flex-1 flex items-center">
                                        <textarea
                                            id="tokens"
                                            value={tokens}
                                            onChange={handleChangeTokens}
                                            placeholder="Ingrese tokens separados por comas"
                                            className="text-lg w-60 peer border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove"
                                        />
                                        <label
                                            htmlFor="tokens"
                                            className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                        >
                                            Tokens: ABCDE, EDCBA, QWERT
                                        </label>
                                    </div>
                                </div>

                                {!exito && (
                                    <div className='pb-2'>
                                        <button type="submit" className="mt-10 px-4 py-2 rounded-xl bg-azulMove text-white font-semibold text-center block w-full cursor-pointer">
                                            CARGAR TOKENS
                                        </button>
                                    </div>
                                )}

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CargarTokens
