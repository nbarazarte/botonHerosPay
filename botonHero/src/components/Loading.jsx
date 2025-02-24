import React from 'react'
import { useSelector } from 'react-redux';
import Lottie from "lottie-react";
import loadingLottie from "../assets/LottieFiles/Animation - 1737389234353.json";
import bankWait from "../assets/LottieFiles/Animation - 1738285370531.json";

const Loading = () => {

    // Seleccionar estados desde Redux
    const { loadingBankWait } = useSelector((state) => state.debitoInmediato);

    return (
        <>
            <div className={`flex justify-center items-center ${loadingBankWait ? 'pt-24' : ''}`}>
                <Lottie animationData={loadingLottie} loop={true} style={{ width: '100px', height: '100px' }} />
            </div>
            {loadingBankWait && (
                <>
                    <p className='text-lg text-center font-semibold'>Por favor espere mientras el banco procesa la solicitud.</p>
                    <div className="flex flex-1 justify-center items-center">
                        <Lottie animationData={bankWait} loop={true} style={{ width: '150px', height: '150px' }} />
                    </div>
                </>
            )}
        </>
    )
}

export default Loading
