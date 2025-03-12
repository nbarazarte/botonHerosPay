import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  textoBoton: 'Copiar Token',
  numeroFactura: null,
  identificadorAp: null,
  pagoExitoso: false,
  selectedCodigoArea: '',
  telefono: '',
  numTelefono: '',
  monto: '1.00',
  token: '',
  error: null,
  errorPago: '',
  errorApiR4: null,
  loading: false,
  loadingBankWait: false,
  copied: false,
  loading: false,
  mensajeApis: null,
  selectedNacionalidad: '',
  referencia: '',
  timeLeft: 60,
};

export const pagoMovilSlice = createSlice({
  name: 'pagoMovil',
  initialState,
  reducers: {
    setMensajeApis: (state, action) => {
      state.mensajeApis = action.payload;
    },
    setTextoBoton: (state, action) => {
      state.textoBoton = action.payload;
    },
    setNumeroFactura: (state, action) => {
      state.numeroFactura = action.payload;
    },
    setIdentificadorAp: (state, action) => {
      state.identificadorAp = action.payload;
    },
    setPagoExitoso: (state, action) => {
      state.pagoExitoso = action.payload;
    },
    setReferencia: (state, action) => {
      state.referencia = action.payload;
    },
    setSelectedCodigoArea: (state, action) => {
      state.selectedCodigoArea = action.payload;
    },
    setTelefono: (state, action) => {
      state.telefono = action.payload;
    },
    setNumTelefono: (state, action) => {
      state.numTelefono = action.payload;
    },
    setMonto: (state, action) => {
      state.monto = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setErrorPago: (state, action) => {
      state.errorPago = action.payload;
    },
    setErrorApiR4: (state, action) => {
      state.errorApiR4 = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setLoadingBankWait: (state, action) => {
      state.loadingBankWait = action.payload;
    },
    setCopied: (state, action) => {
      state.copied = action.payload;
    },
    setTimeLeft: (state, action) => {
      state.timeLeft = action.payload;
    },
    decrementTimeLeft: (state) => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1;
      }
    },
  },
});

export const {
  setMensajeApis,
  setTextoBoton,
  setNumeroFactura,
  setIdentificadorAp,
  setPagoExitoso,
  setReferencia,
  setSelectedCodigoArea,
  setTelefono,
  setNumTelefono,
  setMonto,
  setToken,
  setError,
  setErrorPago,
  setErrorApiR4,
  setLoading,
  setLoadingBankWait,
  setCopied,
  setTimeLeft,
  decrementTimeLeft,
} = pagoMovilSlice.actions;

export default pagoMovilSlice.reducer;
