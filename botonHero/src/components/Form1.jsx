import React from 'react'
import FormFields from './FormFields';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Form1 = ({
    handleSubmitSinOtp,
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
    setSelectedCodigoArea,
    setNumTelefono,
    setConcepto,
    so
}) => {
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