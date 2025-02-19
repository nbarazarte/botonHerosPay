import React from 'react'
import FormFields from './FormFields';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const Form1 = ({
    setLoading,
    setToken,
    setVieneForm1,
    setDataForm,
    setMsjOtp,
    setShowOtpForm1,
    setShowOtpForm2,
    selectedBank,
    bankOptions,
    selectedNacionalidad,
    nacionalidad,
    cedula,
    setCedula,
    selectedCodigoArea,
    codigosArea,
    telefono,
    setTelefono,
    monto,
    setMonto,
    setError,
    setSelectedBank,
    setSelectedNacionalidad,
    setNacionalidadCedula,
    nacionalidadCedula,
    setSelectedCodigoArea,
    setNumTelefono,
    numTelefono,
    setConcepto,
    so,
    url,
    urlMibanco3,
    concepto,
    setErrorApiR4,
    setTimeLeft,
    timeLeft,
    tokenCommerce,
    headers
}) => {

    const headersR4 = (dataToHash) => {

        const hash2 = CryptoJS.HmacSHA256(dataToHash, tokenCommerce);
        const hmac2 = hash2.toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `${hmac2}`,
            'Commerce': `${tokenCommerce}`
        };

        return headers
    }

    const handleSubmitSinOtp = async (e) => {
        e.preventDefault();

        // Intento de obtención del token
        try {

            const token = await axios.get(`${url}buscar_token`, { headers });
            if (!token.data) { setError(`No hay tokens disponibles, \n intente luego.`); return }
            if (!selectedBank) { setError('Seleccione un Banco'); return; }
            if (!selectedNacionalidad || !cedula) { setError('Indique Cédula o RIF'); return; }
            if (!selectedCodigoArea || !telefono) { setError('Indique Teléfono'); return; }

            setLoading(true);

            const postData = {
                Banco: selectedBank,
                Monto: monto,
                Telefono: numTelefono,
                Cedula: nacionalidadCedula,
                Concepto: concepto
            };

            // Obtener nombre del banco usando el codigo del banco
            const banco = await axios.get(`${url}buscar_banco?codigo=${postData.Banco}`, { headers });
            await handleGenerarOtp(postData);

            setMsjOtp(`En breve recibirá un mensaje al número ${postData.Telefono} de ${banco.data.nombre_banco}. Copie y pegue el código recibido.`)
            setDataForm(postData) //para usarlo cuando envie con: handleSubmitConOtp
            setShowOtpForm1(false)
            setShowOtpForm2(true)
            setVieneForm1(true)

            localStorage.setItem('mensajeOtp', `Si ya recibió el mensaje en el número ${postData.Telefono} de ${banco.data.nombre_banco}. Copie y pegue el código recibido.`);
            localStorage.setItem('mensajeOtp2', `Si no recibió el mensaje, verifique sus datos ingresados, e intente nuevamente.`)
            localStorage.setItem('dataFormulario', JSON.stringify(postData));
            localStorage.setItem('formulario1', false);
            localStorage.setItem('formulario2', true);

        } catch (err) {
            setError(err);
            setToken(null);
        } finally {
            setLoading(false); // Oculta el loading
        }

    };

    const handleGenerarOtp = async (postData) => {

        try {

            const { Banco, Cedula, Telefono, Monto, Concepto } = postData;
            const dataToHash = `${Banco}${Monto}${Telefono}${Cedula}`;
            const headersMiBanco = headersR4(dataToHash);

            const data = {
                Banco: Banco,
                Monto: Monto,
                Telefono: Telefono,
                Cedula: Cedula
            }

            const miBancoGenerarOtp = await axios.post(`${urlMibanco3}`, data, { headers: headersMiBanco });

            if (timeLeft > 0) {
                const interval = setInterval(() => {
                    setTimeLeft((prevTime) => {
                        if (prevTime - 1 <= 0) {
                            clearInterval(interval);
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);

                return () => clearInterval(interval);
            }

            return miBancoGenerarOtp.data;

        } catch (error) {
            setError('Ocurrió un error al procesar la consulta');
            setErrorApiR4('En estos momentos, la plataforma bancaria no está disponible. Por favor, intente más tarde.');
            return null;
        }
    };

    return (

        <div className="pt-10 flex flex-1 h-full justify-center items-center">
            <form className="mt-1" onSubmit={handleSubmitSinOtp}>

                <FormFields
                    selectedBank={selectedBank}
                    bankOptions={bankOptions}
                    selectedNacionalidad={selectedNacionalidad}
                    nacionalidad={nacionalidad}
                    cedula={cedula}
                    setCedula={setCedula}
                    selectedCodigoArea={selectedCodigoArea}
                    codigosArea={codigosArea}
                    telefono={telefono}
                    setTelefono={setTelefono}
                    monto={monto}
                    setMonto={setMonto}
                    setError={setError}
                    setSelectedBank={setSelectedBank}
                    setSelectedNacionalidad={setSelectedNacionalidad}
                    setNacionalidadCedula={setNacionalidadCedula}
                    setSelectedCodigoArea={setSelectedCodigoArea}
                    setNumTelefono={setNumTelefono}
                    setConcepto={setConcepto}
                />

                <div className='pb-2'>
                    <button type="submit" className="mt-10 px-4 py-2 rounded-xl bg-azulMove text-white font-sans font-semibold text-sm text-center block w-full cursor-pointer">
                        ENVIAR DATOS DE PAGO
                    </button>
                </div>

                {so == 'iOS' && (
                    <div className='pb-2'>
                        <a onClick={() => {
                            setShowOtpForm1(false)
                            setShowOtpForm2(true)
                        }} className="mt-4 text-blue-700 font-sans font-semibold text-lg text-center block  cursor-pointer">
                            <FontAwesomeIcon icon="fa-brands fa-apple" /> Ya tengo un código OTP
                        </a>
                    </div>
                )}

            </form>
        </div>
    )
}

export default Form1