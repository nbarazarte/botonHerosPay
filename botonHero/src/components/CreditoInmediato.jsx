import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import '../assets/styles.css'; // Importa el archivo CSS
import copy from "copy-to-clipboard";
import Swal from 'sweetalert2'
import Lottie from "lottie-react";
import paySuccess from "../assets/LottieFiles/Animation - 1737322786287.json";
import wifi from "../assets/LottieFiles/Animation - 1737384712836.json";
import loadingLottie from "../assets/LottieFiles/Animation - 1737389234353.json";
import formError from "../assets/LottieFiles/Animation - 1737642103978.json";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const CreditoInmediato = () => {

    const [selectedNacionalidad, setSelectedNacionalidad] = useState('');
    const [cedula, setCedula] = useState('');
    const [nacionalidadCedula, setNacionalidadCedula] = useState('');
    const [selectedCodigoArea, setSelectedCodigoArea] = useState('');
    const [telefono, setTelefono] = useState('');
    const [numTelefono, setNumTelefono] = useState('');
    const [monto, setMonto] = useState('1.00');
    const [concepto, setConcepto] = useState('Pago de Internet');
    const [token, setToken] = useState(null);
    const [error, setError] = useState('');
    const [errorPago, setErrorPago] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [bankOptions, setBankOptions] = useState([]);
    const nacionalidad = ['V', 'E', 'J'];
    const codigosArea = ['0412', '0416', '0426', '0414', '0424'];
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState("");
    const [copied, setCopied] = useState(false);

    const urlApiBotonLocal = import.meta.env.REACT_APP_URL_API_BOTON_LOCAL;
    const urlApiMiBancoLocal = import.meta.env.REACT_APP_URL_API_MIBANCO_LOCAL;

    const urlApiBotonServidor = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR;
    const urlApiMiBancoServidor = import.meta.env.REACT_APP_URL_API_MIBANCO_SERVIDOR;

    const urlApiBotonServidorPublico = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR_PUBLICO;
    const urlApiMiBancoServidorPublico = import.meta.env.REACT_APP_URL_API_MIBANCO_SERVIDOR_PUBLICO;

    const tokenApi = import.meta.env.REACT_APP_TOKEN;
    const headers = { 'Authorization': `Bearer ${tokenApi}` };

    // ###########################  NOTA  ###############################
    // si se va a trabajar local:
    //const [url, setUrl] = useState(urlApiBotonLocal);
    //const [urlMibanco, setUrlMiBanco] = useState(urlApiMiBancoLocal);

    // si se va a trabajar servidor:
    //const [url, setUrl] = useState(urlApiBotonServidor);
    //const [urlMibanco, setUrlMiBanco] = useState(urlApiMiBancoServidor);

    // si se va a trabajar servidor Publico:
    const [url, setUrl] = useState(urlApiBotonServidor);
    const [urlMibanco, setUrlMiBanco] = useState(urlApiMiBancoServidor);
    // ###################################################################

    const handleCopy = () => {
        //console.log('copiando');
        copy(token.token, {
            debug: true,
            message: "Press #{key} to copy"
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 3000); // Reset after 3 seconds
    };

    const handleSelectChange = (event) => { setSelectedBank(event.target.value); };

    const handleSelectChangeNacionalidad = (e) => {
        setSelectedNacionalidad(e.target.value);
        setNacionalidadCedula(e.target.value + cedula);

        // Limpiar el input de cedula si se selecciona 'V' o 'E'
        if (e.target.value === 'V' || e.target.value === 'E' || e.target.value === 'J') {
            setCedula('');
        }

    };

    const handleChangeCedula = (e) => {
        const value = e.target.value;
        // Permitir solo números (0-9)
        const onlyNumbers = value.replace(/[^0-9]/g, '');
        setCedula(onlyNumbers);
        setNacionalidadCedula(selectedNacionalidad + onlyNumbers);
    };

    const handleSelectChangeCodigoArea = (e) => {
        setSelectedCodigoArea(e.target.value);
        setNumTelefono(e.target.value + telefono);
    };

    const handleChangeTelefono = (e) => {
        const value = e.target.value;
        // Permitir solo números (0-9)
        const onlyNumbers = value.replace(/[^0-9]/g, '');
        setTelefono(onlyNumbers);
        setNumTelefono(selectedCodigoArea + onlyNumbers);
    };

    const handleChangeConcepto = (e) => {
        setConcepto(e.target.value);
    };

    const handleChangeMonto = (e) => {
        setMonto(e.target.value);
    };

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const response = await axios.get(`${url}bancos`, { headers });
                setBankOptions(response.data);
            } catch (error) {
                console.error("Error obteniendo bancos:", error);
            }
        };

        fetchBanks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedBank) { setError('Seleccione un Banco'); return; }
        if (!selectedNacionalidad || !cedula) { setError('Indique Cédula o RIF'); return; }
        if (!selectedCodigoArea || !telefono) { setError('Indique Teléfono'); return; }

        setLoading(true);

        try {
            const postData = {
                Banco: selectedBank,
                Cedula: nacionalidadCedula,
                Telefono: numTelefono,
                Monto: monto,
                Concepto: concepto
            };

            // Primera petición POST: Api de Mi Banco
            const miBanco = await axios.post(`${urlMibanco}`, postData);
            setError('');

            if (miBanco.data.code === 'ACCP') {
                try {
                    // Intento de obtención del token
                    let token;
                    try {
                        token = await axios.get(`${url}buscar_token`, { headers });
                    } catch (error) {
                        console.log("Fallo obteniendo token:", error);
                    }

                    setToken(token.data);
                    setError('');

                    // Actualización del token
                    try {
                        await axios.put(`${url}${token.data.id}`, { used: true }, { headers });
                    } catch (error) {
                        console.log("Fallo actualizando token:", error);
                    }

                    // Obtener id del banco usando el codigo del banco
                    let banco;
                    try {
                        banco = await axios.get(`${url}buscar_banco?codigo=${postData.Banco}`, { headers });
                    } catch (error) {
                        console.log("Fallo obteniendo id del banco:", error);
                    }

                    let cliente = null;
                    let cliente_id = null;

                    // Obtener id del cliente usando la cedula
                    try {
                        cliente = await axios.get(`${url}buscar_cliente?cedula=${postData.Cedula}`, { headers });
                    } catch (error) {
                        console.log("Fallo obteniendo id del cliente:", error);
                    }

                    if (cliente.data.id) {
                        cliente_id = cliente.data.id;
                    } else {
                        // Guardo al cliente:
                        try {
                            cliente = await axios.post(`${url}crear_cliente`, { cedula: postData.Cedula }, { headers });
                        } catch (error) {
                            console.log("Fallo guardando cliente:", error);
                        }
                        cliente_id = cliente.data.id;
                    }

                    // Guardo el cliente_id y token_id
                    let cliente_token;
                    try {
                        cliente_token = await axios.post(`${url}cliente_tokens`, {
                            cliente_id: cliente_id,
                            token_id: token.data.id
                        }, { headers });
                    } catch (error) {
                        console.log("Fallo guardando en cliente_token:", error);
                    }
                    //console.log(cliente_token.data);

                    // Guardo la transacción
                    let transac;
                    try {
                        transac = await axios.post(`${url}crear_transac`, {
                            cliente_token_id: cliente_token.data.id,
                            telefono: postData.Telefono,
                            banco_id: banco.data.id,
                            monto: postData.Monto,
                            referencia: miBanco.data.reference,
                            descripcion: ''
                        }, { headers });
                    } catch (error) {
                        console.log("Fallo guardando la transaccion:", error);
                    }
                    //console.log(transac.data);

                } catch (err) {
                    setErrorPago("Ha ocurrido un error con el token");
                    setToken(null);
                }
            }

        } catch (err) {
            setError(err);
            console.error("Error-->:", err);
            setToken(null);
        } finally {
            setLoading(false); // Oculta el loading
        }
    };

    /*     useEffect(() => {
            if (token) {
                setText(token.token);
                handleCopy();
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: `Token: ${token.token} copiado!`,
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        }, [token]); */

    return (

        <div className="flex-1">
            <div className="w-80 rounded-3xl mx-auto overflow-hidden"> {/* shadow-xl */}
                <div className="bg-white pb-8 rounded-tr-4xl">
                    {/* <h1 className="text-2xl font-semibold text-gray-900">Crédito Inmediato</h1> */}

                    {loading ? (
                        <div className="flex justify-center items-center">
                            <Lottie animationData={loadingLottie} loop={false} style={{ width: '50px', height: '50px' }} />
                        </div>
                    ) : (

                        <>
                            {error ? (
                                <div className="flex justify-center items-center">
                                    <div className="bg-red-100 border-t-4 border-red-500 rounded-b text-teal-900 px-4 py-3 shadow-md w-60" role="alert">
                                        <div className="flex justify-center items-center text-center">
                                            <div>
                                                <p className="text-sm">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (

                                <div className="justify-center items-center">

                                    <div className="justify-center items-center text-center">

                                        <h1 className="text-2xl">Pasarela de Pagos</h1>
                                        <h3 className="text-sm">Crédito Inmediato</h3>

                                    </div>
                                </div>

                            )}

                            {token ? (

                                <div className="flex justify-center items-center">
                                    <div className="bg-green-100 border-t-4 border-green-500 rounded-b text-green-900 px-4 py-1 shadow-md w-full" role="alert">

                                        <div className="flex justify-center items-center text-center">
                                            <div className='justify-center items-center' >

                                                <div className="flex flex-row justify-center items-center gap-1">
                                                    <Lottie animationData={paySuccess} loop={false} style={{ width: '20px', height: '20px' }} />
                                                    <p className="text-sm">¡Aprobado!</p>
                                                </div>

                                                <div className="flex flex-row justify-center items-center gap-1">
                                                    <Lottie animationData={wifi} loop={true} style={{ width: '30px', height: '30px' }} />
                                                    <p className="text-sm justify-center items-center">
                                                        Token de acceso: <span className='font-bold'>{token.token}</span>
                                                    </p>

                                                    <button className="hover:text-black text-gray-400 text-center cursor-pointer" onClick={handleCopy}>
                                                        <FontAwesomeIcon icon="fa-regular fa-copy" />
                                                    </button>
                                                </div>

                                            </div>
                                        </div>

                                    </div>
                                </div>

                            ) : (
                                <>
                                    {errorPago && (
                                        <div className="flex justify-center items-center">
                                            <div className="bg-red-100 border-t-4 border-red-500 rounded-b text-teal-900 px-4 py-3 shadow-md w-full" role="alert">
                                                <div className="flex justify-center items-center text-center">
                                                    <div>
                                                        <p className="text-sm">{errorPago}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {!bankOptions.length == 0 ? (

                        <div className="flex flex-1 h-full justify-center items-center">
                            <form className="mt-8" onSubmit={handleSubmit}>
                                <label htmlFor="bank" className="block">
                                    <select value={selectedBank} onChange={handleSelectChange} className="pl-1 pr-1 w-56 mt-0 px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black" id="bank">
                                        <option value="" disabled>Bancos</option>
                                        {bankOptions.map((bank) => (
                                            <option key={bank.codigo_banco} value={bank.codigo_banco}>{`${bank.codigo_banco} - ${bank.nombre_banco}`}</option>
                                        ))}
                                    </select>
                                </label>

                                <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">

                                    <div className="relative flex-1">
                                        <label htmlFor="nacionalidad" className="block">
                                            <select value={selectedNacionalidad} onChange={handleSelectChangeNacionalidad}
                                                className="pl-1 pr-1 w-20 mt-0 px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black" id="nacionalidad">

                                                <option value="" disabled>N/J</option>
                                                {nacionalidad.map((nacio, index) => (
                                                    <option key={index} value={nacio}>{nacio}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    <div className="relative flex-1">
                                        <input id="cedula" type="number"
                                            value={cedula}
                                            placeholder="Cédula/RIF."
                                            onChange={handleChangeCedula}
                                            //maxLength={8} 
                                            onInput={(e) => {
                                                const maxLength = selectedNacionalidad === 'J' ? 9 : 8;
                                                e.target.value = e.target.value.slice(0, maxLength);
                                            }}
                                            className="w-36 peer border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-rose-600" />
                                        <label htmlFor="cedula" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Cédula/RIF.</label>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">

                                    <div className="relative flex-1">
                                        <label htmlFor="telefono" className="block">
                                            <select value={selectedCodigoArea} onChange={handleSelectChangeCodigoArea}
                                                className="pl-1 pr-1 w-20 mt-0 px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black" id="telefono">
                                                <option value="" disabled>Cód.</option>
                                                {codigosArea.map((codigoArea, index) => (
                                                    <option key={index} value={codigoArea}>{codigoArea}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    <div className="relative flex-1">
                                        <input id="telefono" type="number"
                                            value={telefono}
                                            placeholder="Teléfono"
                                            onChange={handleChangeTelefono}
                                            //maxLength={7} 
                                            onInput={(e) => { e.target.value = e.target.value.slice(0, 7) }}
                                            className="w-36 peer border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-rose-600" />
                                        <label htmlFor="telefono" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Teléfono</label>
                                    </div>

                                </div>

                                <div className="mt-8 relative flex flex-row pl-1 pr-1">
                                    <input id="monto" type="text"
                                        value={`$${monto}`}
                                        onChange={handleChangeMonto}
                                        readOnly className="w-56 peer h-10 border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-rose-600" />
                                    <label htmlFor="monto" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Monto</label>
                                </div>

                                <div className="mt-8 relative flex flex-row pl-1 pr-1">
                                    <input id="concepto" type="text"
                                        value={concepto}
                                        onChange={handleChangeConcepto}
                                        readOnly className="w-56 peer h-10 border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-rose-600" />
                                    <label htmlFor="concepto" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Concepto</label>
                                </div>

                                {(!token || loading) && (
                                    <div className='pb-2'>

                                        {/*                                         <button type="submit" className="mt-10 px-4 py-2 rounded bg-rose-500 hover:bg-rose-400 text-white font-semibold text-center block w-full focus:outline-none focus:ring focus:ring-offset-2 focus:ring-rose-500 focus:ring-opacity-80 cursor-pointer">
                                            VERIFICAR
                                        </button> */}
                                        <button type="submit" className="mt-10 px-4 py-2 rounded-xl bg-azulMove text-white font-semibold text-center block w-full cursor-pointer">
                                            VERIFICAR
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
    )
};

export default CreditoInmediato;
