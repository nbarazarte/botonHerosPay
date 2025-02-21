import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  vieneForm1: false,
  so: '',
  mensajeApis: '',
  textoBoton: 'Copiar Token',
  numeroFactura: null,
  identificadorAp: null,
  pagoExitoso: false,
  isVisible: true,
  msjOtp: '',
  msjOtp2: '',
  selectedNacionalidad: 'V',
  cedula: '',
  nacionalidadCedula: '',
  selectedCodigoArea: '',
  telefono: '',
  numTelefono: '',
  monto: '1.00',
  concepto: 'Pago de Internet',
  otp: '',
  dataForm: {},
  token: '',
  error: null,
  errorPago: '',
  errorApiR4: null,
  selectedBank: '',
  bankOptions: [],
  loading: false,
  loadingBankWait: false,
  copied: false,
  timeLeft: 59,
  showOtpForm1: true,
  showOtpForm2: false,
};

export const debitoInmediatoSlice = createSlice({
  name: 'debitoInmediato',
  initialState,
  reducers: {
    setVieneForm1: (state, action) => {
      state.vieneForm1 = action.payload;
    },
    setSO: (state, action) => {
      state.so = action.payload;
    },
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
    setIsVisible: (state, action) => {
      state.isVisible = action.payload;
    },
    setMsjOtp: (state, action) => {
      state.msjOtp = action.payload;
    },
    setMsjOtp2: (state, action) => {
      state.msjOtp2 = action.payload;
    },
    setSelectedNacionalidad: (state, action) => {
      state.selectedNacionalidad = action.payload;
    },
    setCedula: (state, action) => {
      state.cedula = action.payload;
    },
    setNacionalidadCedula: (state, action) => {
      state.nacionalidadCedula = action.payload;
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
    setConcepto: (state, action) => {
      state.concepto = action.payload;
    },
    setOtp: (state, action) => {
      state.otp = action.payload;
    },
    setDataForm: (state, action) => {
      state.dataForm = action.payload;
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
    setSelectedBank: (state, action) => {
      state.selectedBank = action.payload;
    },
    setBankOptions: (state, action) => {
      state.bankOptions = action.payload;
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
    setShowOtpForm1: (state, action) => {
      state.showOtpForm1 = action.payload;
    },
    setShowOtpForm2: (state, action) => {
      state.showOtpForm2 = action.payload;
    },
    decrementTimeLeft: (state) => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1;
      }
    },
  },
});

export const {
  setVieneForm1,
  setSO,
  setMensajeApis,
  setTextoBoton,
  setNumeroFactura,
  setIdentificadorAp,
  setPagoExitoso,
  setIsVisible,
  setMsjOtp,
  setMsjOtp2,
  setSelectedNacionalidad,
  setCedula,
  setNacionalidadCedula,
  setSelectedCodigoArea,
  setTelefono,
  setNumTelefono,
  setMonto,
  setConcepto,
  setOtp,
  setDataForm,
  setToken,
  setError,
  setErrorPago,
  setErrorApiR4,
  setSelectedBank,
  setBankOptions,
  setLoading,
  setLoadingBankWait,
  setCopied,
  setTimeLeft,
  setShowOtpForm1,
  setShowOtpForm2,
  decrementTimeLeft,
} = debitoInmediatoSlice.actions;

export default debitoInmediatoSlice.reducer;
