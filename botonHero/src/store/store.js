import { configureStore } from '@reduxjs/toolkit';
import debitoInmediatoReducer from './debitoInmediatoSlice';
import creditoInmediatoReducer from './creditoInmediatoSlice';

export const store = configureStore({
    reducer: {
        debitoInmediato: debitoInmediatoReducer,
        creditoInmediato: creditoInmediatoReducer,
    },
});
