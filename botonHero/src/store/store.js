import { configureStore } from '@reduxjs/toolkit';
import debitoInmediatoReducer from './debitoInmediatoSlice';
import creditoInmediatoReducer from './creditoInmediatoSlice';
import pagoMovilReducer from './pagoMovilSlice';

export const store = configureStore({
    reducer: {
        debitoInmediato: debitoInmediatoReducer,
        creditoInmediato: creditoInmediatoReducer,
        pagoMovil: pagoMovilReducer,
    },
});
