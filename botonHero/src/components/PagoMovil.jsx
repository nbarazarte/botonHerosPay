import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setErrorApiR4, setMensajeApis, setError, setLoading, setToken, setIdentificadorAp, setMonto, setSelectedNacionalidad, setNacionalidadCedula, setCedula, setReferencia, setIdCliente, setShowForm1, setShowForm2, setNumeroFactura, setSO } from '../store/pagoMovilSlice';
import { useParams } from 'react-router-dom';
import platform from 'platform';
import axios from 'axios';
import Lottie from "lottie-react";
import formError from "../assets/LottieFiles/Animation - 1738074669174.json";
import pagoMovil from "../assets/LottieFiles/Animation - 1741919011118.json";
import ErrorApiR4 from './ErrorApiR4';
import SuccessPagoMovil from './SuccessPagoMovil';
import { HeadersR4, obtenerFechaValor } from './utils';
import Loading from './Loading';

const PagoMovil = () => {
    const dispatch = useDispatch();
    const {
        error,
        loading,
        token,
        errorApiR4,
        referencia,
        cedula,
        selectedNacionalidad,
        nacionalidadCedula,
        monto,
        showForm1,
        showForm2,
        identificadorAp,
        idCliente,
        so,
        mensajeApis
    } = useSelector((state) => state.pagoMovil);

    const { idSitio, plan, montoPlan } = useParams();
    const url = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR_PUBLICO;
    const headers = { 'Authorization': `Bearer ${import.meta.env.REACT_APP_TOKEN}` };
    const telefonoComercio = import.meta.env.REACT_APP_TELEFONOCOMERCIO;
    const urlMiBancoBcv = import.meta.env.REACT_APP_URL_API_MIBANCO_BCV;
    const tokenCommerce = import.meta.env.REACT_APP_TOKEN_COMMERCE;
    const nacionalidad = ['V', 'E', 'J'];

    useEffect(() => {
        const fetchSitioMonto = async () => {
            try {
                const soInfo = platform.os.family;
                dispatch(setSO(soInfo));

                const sitio = await axios.get(`${url}sitios?idAp=${idSitio}`, { headers });
                dispatch(setIdentificadorAp(sitio.data.id));

                const fechaValor = obtenerFechaValor();
                const dataToHash = `${fechaValor}USD`;
                const headersMiBanco = HeadersR4({ dataToHash, tokenCommerce });
                const postData = { Moneda: "USD", Fechavalor: fechaValor };
                const tasaBcv = await axios.post(`${urlMiBancoBcv}`, postData, { headers: headersMiBanco });

                //console.log(Number(Math.round(montoPlan * 100) / 100));
                //console.log(Number(Math.round(tasaBcv.data.tipocambio * 100) / 100));

                dispatch(setMonto((Number(Math.round(montoPlan * 100) / 100) *  Number(Math.round(tasaBcv.data.tipocambio * 100) / 100) )));
            } catch (error) {

                //console.log(error.config.url.includes('r4conecta'));            
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

        fetchSitioMonto();
    }, [idSitio, montoPlan, url, headers, tokenCommerce, dispatch]);

    const handleSelectChangeNacionalidad = (e) => {
        dispatch(setError(''));
        dispatch(setSelectedNacionalidad(e.target.value));
        dispatch(setNacionalidadCedula(e.target.value + cedula));

        if (e.target.value === 'V' || e.target.value === 'E' || e.target.value === 'J') {
            dispatch(setCedula(''));
        }
    };

    const handleChangeCedula = (e) => {
        dispatch(setError(''));
        const value = e.target.value;
        const onlyNumbers = value.replace(/[^0-9]/g, '');
        dispatch(setCedula(onlyNumbers));
        dispatch(setNacionalidadCedula(selectedNacionalidad + onlyNumbers));
    };

    const handleChangeReferencia = (e) => {
        dispatch(setError(''));
        const value = e.target.value;
        const onlyNumbers = value.replace(/[^0-9]/g, '');
        dispatch(setReferencia(onlyNumbers));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedNacionalidad || !cedula) { dispatch(setError('Indique Cédula o RIF')); return; }

        let postData = { Cedula: nacionalidadCedula };

        let cliente = await axios.get(`${url}buscar_cliente?cedula=${postData.Cedula}`, { headers });

        if (!cliente.data.id) {
            cliente = await axios.post(`${url}crear_cliente`, { cedula: postData.Cedula }, { headers });
        }

        await axios.post(`${url}crear_cliente_monto_pm`, { cliente_id: cliente.data.id, monto: montoPlan }, { headers });

        dispatch(setIdCliente(cliente.data.id));
        dispatch(setShowForm1(false));
        dispatch(setShowForm2(true));
    }

    const handleSubmit2 = async (e) => {
        e.preventDefault();

        if (!referencia) { dispatch(setError('Indique la referencia')); return; }

        let postData = { Referencia: referencia, Monto: monto };

        let notificacion = await axios.get(`${url}buscar_notificacion?referencia=${postData.Referencia}&monto=${monto}`, { headers });
        const codigoBanco = `0${notificacion.data.bancoemisor}`;

        if (!notificacion.data.referencia) {
            dispatch(setError('Verifique el número de referencia y el monto.')); return;
        }

        const token = await axios.get(`${url}buscar_token?plan=${plan}&sitio=${identificadorAp}`, { headers });

        if (!token.data) { dispatch(setError('No hay tokens disponibles')); return; }
        dispatch(setToken(token.data));

        await axios.put(`${url}${token.data.id}`, { used: true }, { headers });
        const banco = await axios.get(`${url}buscar_banco?codigo=${codigoBanco}`, { headers });

        const cliente_token = await axios.post(`${url}cliente_tokens`, {
            cliente_id: idCliente,
            token_id: token.data.id
        }, { headers });

        const transac = await axios.post(`${url}crear_transac`, {
            cliente_token_id: cliente_token.data.id,
            telefono: notificacion.data.telefonoemisor,
            banco_id: banco.data.id,
            monto: monto,
            referencia: referencia,
            descripcion: '',
            pasarela_id: 3,
            sitio_id: identificadorAp,
            sistema_operativo: so
        }, { headers });

        dispatch(setNumeroFactura(transac.data.id.toString().padStart(5, '0')));
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
                                                : (<><h1 className="text-lg font-medium">Pago Móvil</h1> </>)}
                                        </div>
                                    </div>
                                    {token && (<SuccessPagoMovil />)}
                                </>
                            )}

                            <div className="pt-2 flex flex-column h-full justify-center items-center">

                                {showForm1 === true && (
                                    <form className="mt-1" onSubmit={handleSubmit}>
                                        <h1 className=' text-center'>Paso 1 de 2</h1>
                                        <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">
                                            <div className="relative flex-1 flex items-center">
                                                <label htmlFor="nacionalidad" className="block">
                                                    <select
                                                        value={selectedNacionalidad}
                                                        onChange={handleSelectChangeNacionalidad}
                                                        className="text-lg bg-white pl-1 pr-1 w-20 px-0.5 border-0 border-b-1 border-azulMove focus:ring-0 focus:border-naranjaMove"
                                                        id="nacionalidad"
                                                    >
                                                        <option value="" disabled className='text-center'>N/J</option>
                                                        {nacionalidad.map((nacio, index) => (
                                                            <option key={index} value={nacio} className='text-center'>{nacio}</option>
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
                                                    onChange={handleChangeCedula}
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

                                        <div className='pb-2'>
                                            <button type="submit" className="mt-10 px-4 py-2 rounded-xl bg-azulMove text-white font-sans font-semibold text-sm text-center block w-full cursor-pointer">
                                                REGISTRARSE
                                            </button>
                                        </div>

                                    </form>
                                )}

                                {showForm2 === true && (
                                    <form className="mt-1" onSubmit={handleSubmit2}>

                                        <h1 className=' text-center pb-0'>Paso 2 de 2</h1>

                                        <ol>
                                            <li>1. Abra su aplicación de Pago Móvil.</li>
                                            <li>2. Teléfono: <span className='font-semibold'>{telefonoComercio}</span></li>
                                            <li>3. CI/Rif Beneficiario: <span className='font-semibold'>{nacionalidadCedula.replace("V", "")}</span></li>
                                            <li>4. Monto: <span className='font-semibold'>{`Bs.${monto}`}</span></li>
                                            <li>5. Ingrese el número de referencia.</li>
                                        </ol>
                                        <div className="mt-0 relative flex flex-row pl-1 pr-1 justify-center items-center">
                                            <Lottie animationData={pagoMovil} loop={true} style={{ width: '200px', height: '200px' }} />
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
                                                REPORTAR PAGO MOVIL
                                            </button>
                                        </div>

                                    </form>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PagoMovil;
