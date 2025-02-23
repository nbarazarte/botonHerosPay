import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormFields from './FormFields';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { HeadersR4 } from './utils';
import {
    setLoading,
    setToken,
    setVieneForm1,
    setDataForm,
    setMsjOtp,
    setShowOtpForm1,
    setShowOtpForm2,
    setError,
    setErrorApiR4,
    decrementTimeLeft
} from '../store/debitoInmediatoSlice';

const Form1 = ({ url, urlMibanco3, tokenCommerce, headers }) => {
    const dispatch = useDispatch();

    // Seleccionar estados desde Redux
    const {
        selectedBank,
        selectedNacionalidad,
        cedula,
        selectedCodigoArea,
        telefono,
        monto,
        numTelefono,
        nacionalidadCedula,
        concepto,
        so
    } = useSelector(state => state.debitoInmediato);

    let timerId;

    const startTimer = () => {
        // Limpiar cualquier temporizador existente
        if (timerId) {
            clearInterval(timerId);
        }

        // Configurar un nuevo temporizador
        timerId = setInterval(() => {
            dispatch(decrementTimeLeft());
        }, 1000);
    };

    const handleSubmitSinOtp = async (e) => {
        e.preventDefault();

        try {
            const token = await axios.get(`${url}buscar_token`, { headers });
            if (!token.data) { dispatch(setError(`No hay tokens disponibles, \n intente luego.`)); return; }
            if (!selectedBank) { dispatch(setError('Seleccione un Banco')); return; }
            if (!selectedNacionalidad || !cedula) { dispatch(setError('Indique Cédula o RIF')); return; }
            if (!selectedCodigoArea || !telefono) { dispatch(setError('Indique Teléfono')); return; }

            dispatch(setLoading(true));

            const postData = {
                Banco: selectedBank,
                Monto: monto,
                Telefono: numTelefono,
                Cedula: nacionalidadCedula,
                Concepto: concepto
            };

            // Obtener nombre del banco usando el codigo del banco
            const banco = await axios.get(`${url}buscar_banco?codigo=${postData.Banco}`, { headers });
            const otpResponse = await handleGenerarOtp(postData);

            if (otpResponse) {
                dispatch(setMsjOtp(`En breve recibirá un mensaje al número ${postData.Telefono} de ${banco.data.nombre_banco}. Copie y pegue el código recibido.`));
                dispatch(setDataForm(postData)); //para usarlo cuando envie con: handleSubmitConOtp
                dispatch(setShowOtpForm1(false));
                dispatch(setShowOtpForm2(true));
                dispatch(setVieneForm1(true));
                startTimer(); // Iniciar el temporizador aquí
            }

            localStorage.setItem('mensajeOtp', `Si ya recibió el mensaje en el número ${postData.Telefono} de ${banco.data.nombre_banco}. Copie y pegue el código recibido.`);
            localStorage.setItem('mensajeOtp2', `Si no recibió el mensaje, verifique sus datos ingresados, e intente nuevamente.`);
            localStorage.setItem('dataFormulario', JSON.stringify(postData));
            localStorage.setItem('formulario1', false);
            localStorage.setItem('formulario2', true);

        } catch (err) {
            dispatch(setError(err));
            dispatch(setToken(null));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleGenerarOtp = async (postData) => {
        try {
            const { Banco, Cedula, Telefono, Monto } = postData;
            const dataToHash = `${Banco}${Monto}${Telefono}${Cedula}`;
            const headersMiBanco = HeadersR4({ dataToHash, tokenCommerce });
            const data = { Banco, Monto, Telefono, Cedula };
            const miBancoGenerarOtp = await axios.post(`${urlMibanco3}`, data, { headers: headersMiBanco });
            return miBancoGenerarOtp.data;

        } catch (error) {
            dispatch(setError('Ocurrió un error al procesar la consulta'));
            dispatch(setErrorApiR4('En estos momentos, la plataforma bancaria no está disponible. Por favor, intente más tarde.'));
            return null;
        }
    };

    return (
        <div className="pt-2 flex flex-1 h-full justify-center items-center">
            <form className="mt-1" onSubmit={handleSubmitSinOtp}>
                <FormFields />
                <div className='pb-2'>
                    <button type="submit" className="mt-10 px-4 py-2 rounded-xl bg-azulMove text-white font-sans font-semibold text-sm text-center block w-full cursor-pointer">
                        ENVIAR DATOS DE PAGO
                    </button>
                </div>

                {so === 'iOS' && (
                    <div className='pb-2'>
                        <a onClick={() => {
                            dispatch(setShowOtpForm1(false));
                            dispatch(setShowOtpForm2(true));
                        }} className="mt-4 text-blue-700 font-sans font-semibold text-lg text-center block cursor-pointer">
                            <FontAwesomeIcon icon="fa-brands fa-apple" /> Ya tengo un código OTP
                        </a>
                    </div>
                )}
            </form>
        </div>
    );
};

export default Form1;
