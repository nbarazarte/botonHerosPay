import React from 'react'
import FormFields from './FormFields';
import Lottie from "lottie-react";
import bankWait from "../assets/LottieFiles/Animation - 1738285370531.json";
import sms from "../assets/LottieFiles/Animation - 1738195342163.json";

export const Form2 = ({

    pagoExitoso,
    handleSubmitConOtp,
    loading,
    vieneForm1,
    so,
    msjOtp,
    msjOtp2,
    timeLeft,
    isVisible,
    otp,
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
    error,
    setErrorPago,
    setIsVisible,
    setOtp

}) => {

    const handleChangeOtp = (e) => {
        setError('');
        setErrorPago('');
        setOtp(e.target.value);
        setIsVisible(true);
    };

    const RefreshButton = () => (

        <a onClick={() => {
            handledestruir();
            window.location.reload();
        }} className="  text-blue-700 font-sans font-semibold text-xl text-center block  cursor-pointer">
            Ir al inicio
        </a>
    );

    const handledestruir = () => { localStorage.clear(); }

    return (
        <>
            {!pagoExitoso && (

                <div className="flex flex-1 h-full justify-center items-center">

                    <form className="mt-1" onSubmit={handleSubmitConOtp}>

                        {loading ? (
                            <>
                                <p className='text-lg text-center font-semibold'>Por favor espere mientras el banco procesa la solicitud.</p>
                                <div className="flex flex-1 justify-center items-center">
                                    <Lottie animationData={bankWait} loop={true} style={{ width: '150px', height: '150px' }} />
                                </div>
                            </>
                        ) : (
                            <>
                                {(vieneForm1 === true || so !== 'iOS') && (
                                    <>
                                        <p className='text-sm text-center font-semibold'>{msjOtp}</p>
                                        <p className='text-sm text-center'>
                                            {!msjOtp2 ? (<> Si no recibe el mensaje, verifique sus datos ingresados, e intente nuevamente en {timeLeft} segundos. </>) : (msjOtp2)}
                                        </p>
                                        {(timeLeft == 0 || error) && <RefreshButton />}
                                        <div className="mt-8 relative flex flex-row pl-1 pr-1 justify-center items-center">
                                            <Lottie animationData={sms} loop={true} style={{ width: '150px', height: '150px' }} />
                                        </div>
                                    </>
                                )}

                                {(vieneForm1 === false && so === 'iOS') &&

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
                                }
                            </>
                        )}

                        {isVisible && (
                            <div className="mt-8 relative flex flex-row pl-1 pr-1">
                                <input id="otp" type="number"
                                    value={otp}
                                    placeholder=""
                                    onChange={handleChangeOtp}
                                    onInput={(e) => { e.target.value = e.target.value.slice(0, 10) }}
                                    className="w-56 peer h-10 border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove" />
                                <label htmlFor="otp" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Ingrese el código recibido</label>
                            </div>
                        )}

                        <div className='pb-2'>
                            {isVisible && (
                                <>
                                    <button
                                        type="submit"
                                        className="mt-10 px-4 py-2 rounded-xl bg-naranjaMove text-white font-sans font-semibold text-sm text-center block w-full cursor-pointer"
                                    >
                                        CONFIRMAR PAGO
                                    </button>

                                    <div className='pt-5'>
                                        {(vieneForm1 === false && so === 'iOS') && <RefreshButton />}
                                    </div>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </>
    )
}

export default Form2