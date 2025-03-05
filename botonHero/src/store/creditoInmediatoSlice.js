import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    transactionId: null,
    pagoExitoso: false,
    selectedNacionalidad: '',
    cedula: '',
    nacionalidadCedula: '',
    selectedCodigoArea: '',
    telefono: '',
    numTelefono: '',
    monto: '1.00',
    concepto: 'Pago de Internet',
    token: null,
    error: '',
    errorPago: '',
    selectedBank: '',
    bankOptions: [],
    loading: false,
    text: '',
    copied: false,
    idCreditoInmediato: null,
    hmac: '',
    so: '',
};

export const creditoInmediatoSlice = createSlice({
    name: 'creditoInmediato',
    initialState,
    reducers: {
        setTransactionId: (state, action) => {
            state.transactionId = action.payload;
        },
        setPagoExitoso: (state, action) => {
            state.pagoExitoso = action.payload;
        },
        setSO: (state, action) => {
            state.so = action.payload;
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
        setToken: (state, action) => {
            state.token = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setErrorPago: (state, action) => {
            state.errorPago = action.payload;
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
        setText: (state, action) => {
            state.text = action.payload;
        },
        setCopied: (state, action) => {
            state.copied = action.payload;
        },
        setIdCreditoInmediato: (state, action) => {
            state.idCreditoInmediato = action.payload;
        },
        setHmac: (state, action) => {
            state.hmac = action.payload;
        },
        resetState: (state) => {
            return initialState;
        }
    }
});

export const {
    setSO,
    setPagoExitoso,
    setSelectedNacionalidad,
    setCedula,
    setNacionalidadCedula,
    setSelectedCodigoArea,
    setTelefono,
    setNumTelefono,
    setMonto,
    setConcepto,
    setToken,
    setError,
    setErrorPago,
    setSelectedBank,
    setBankOptions,
    setLoading,
    setText,
    setCopied,
    setIdCreditoInmediato,
    setHmac,
    setTransactionId,
    resetState
} = creditoInmediatoSlice.actions;

export default creditoInmediatoSlice.reducer;
