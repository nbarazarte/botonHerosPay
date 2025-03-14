import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    errorApiR4: '',
    loading: '',
    error: '',
    token: '',
    referencia: '',
    cedula: '',
    selectedNacionalidad: 'V',
    nacionalidadCedula: '',
    monto: 0,
    showForm1: true,
    showForm2: false,
    identificadorAp: '',
    idCliente: '',
    so: '',
    numeroFactura: '',
    copied: false,
    textoBoton: 'Copiar Token',
    mensajeApis: '' // New state property for API messages
};

const pagoMovilSlice = createSlice({
    name: 'pagoMovil',
    initialState,
    reducers: {
        setErrorApiR4(state, action) {
            state.errorApiR4 = action.payload;
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
        setToken(state, action) {
            state.token = action.payload;
        },
        setReferencia(state, action) {
            state.referencia = action.payload;
        },
        setCedula(state, action) {
            state.cedula = action.payload;
        },
        setSelectedNacionalidad(state, action) {
            state.selectedNacionalidad = action.payload;
        },
        setNacionalidadCedula(state, action) {
            state.nacionalidadCedula = action.payload;
        },
        setMonto(state, action) {
            state.monto = action.payload;
        },
        setShowForm1(state, action) {
            state.showForm1 = action.payload;
        },
        setShowForm2(state, action) {
            state.showForm2 = action.payload;
        },
        setIdentificadorAp(state, action) {
            state.identificadorAp = action.payload;
        },
        setIdCliente(state, action) {
            state.idCliente = action.payload;
        },
        setSO(state, action) {
            state.so = action.payload;
        },
        setNumeroFactura(state, action) {
            state.numeroFactura = action.payload;
        },
        setCopied(state, action) {
            state.copied = action.payload;
        },
        setTextoBoton(state, action) {
            state.textoBoton = action.payload;
        },
        setMensajeApis(state, action) { // New action to set API messages
            state.mensajeApis = action.payload;
        }
    }
});

export const {
    setErrorApiR4,
    setLoading,
    setError,
    setToken,
    setReferencia,
    setCedula,
    setSelectedNacionalidad,
    setNacionalidadCedula,
    setMonto,
    setShowForm1,
    setShowForm2,
    setIdentificadorAp,
    setIdCliente,
    setSO,
    setNumeroFactura,
    setCopied,
    setTextoBoton,
    setMensajeApis // Exporting new action
} = pagoMovilSlice.actions;

export default pagoMovilSlice.reducer;
