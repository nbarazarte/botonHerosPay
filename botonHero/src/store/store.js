import { configureStore } from '@reduxjs/toolkit';
import debitoInmediatoReducer from './debitoInmediatoSlice';

export const store = configureStore({
  reducer: {
    debitoInmediato: debitoInmediatoReducer,
  },
});
