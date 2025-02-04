import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const DataTable = () => {
    const urlApiBoton = import.meta.env.REACT_APP_URL_API_BOTON_LOCAL;
    const [url, setUrl] = useState(urlApiBoton);
    const tokenApi = import.meta.env.REACT_APP_TOKEN;
    const headers = { 'Authorization': `Bearer ${tokenApi}` };
    const [data, setData] = useState([]);
    const [searchTerms, setSearchTerms] = useState({
        tipo: '',
        token: '',
        cedula: '',
        telefono: '',
        banco: '',
        codigo_banco: '',
        monto: '',
        referencia: '',
        descripcion: '',
        fecha: '',
        hora: ''
    });

    useEffect(() => {
        axios.get(`${url}buscar_transacciones`, { headers })
            .then(response => {
                const modifiedData = response.data.map(item => {
                    const date = new Date(item.fecha_creacion);
                    return {
                        ...item,
                        fecha: date.toLocaleDateString(),
                        hora: date.toLocaleTimeString()
                    };
                });
                setData(modifiedData);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }, []);

    const columns = [
        {
            field: 'id', headerName: 'ID', width: 90, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>ID</div>
                </Box>
            )
        },
        {
            field: 'tipo', headerName: 'TIPO', width: 140, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>TIPO</div>
                    <TextField
                        name="tipo"
                        value={searchTerms.tipo}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },
        {
            field: 'token', headerName: 'TOKEN', width: 120, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>TOKEN</div>
                    <TextField
                        name="token"
                        value={searchTerms.token}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },
        {
            field: 'cedula', headerName: 'CÉDULA', width: 160, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>CÉDULA</div>
                    <TextField
                        name="cedula"
                        value={searchTerms.cedula}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },
        {
            field: 'telefono', headerName: 'TELÉFONO', width: 160, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>TELÉFONO</div>
                    <TextField
                        name="telefono"
                        value={searchTerms.telefono}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },
        {
            field: 'banco', headerName: 'BANCO', width: 220, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>BANCO</div>
                    <TextField
                        name="banco"
                        value={searchTerms.banco}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },
        {
            field: 'codigo_banco', headerName: 'COD.', width: 110, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>COD.</div>
                    <TextField
                        name="codigo_banco"
                        value={searchTerms.codigo_banco}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },
        {
            field: 'monto', headerName: 'MONTO', width: 125, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>MONTO</div>
                    <TextField
                        name="monto"
                        value={searchTerms.monto}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },
        {
            field: 'referencia', headerName: 'REF.', width: 120, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>REF.</div>
                    <TextField
                        name="referencia"
                        value={searchTerms.referencia}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },
        /*         {
                    field: 'descripcion', headerName: 'DESCRIPCIÓN', width: 220, renderHeader: () => (
                        <Box className="flex flex-col items-center">
                            <div>DESCRIPCIÓN</div>
                            <TextField
                                name="descripcion"
                                value={searchTerms.descripcion}
                                onChange={handleSearch}
                                placeholder=""
                                variant="standard"
                                fullWidth
                            />
                        </Box>
                    )
                }, */
        {
            field: 'fecha', headerName: 'FECHA', width: 100, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>FECHA</div>
                    <TextField
                        name="fecha"
                        value={searchTerms.fecha}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },
        {
            field: 'hora', headerName: 'HORA', width: 100, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>HORA</div>
                    <TextField
                        name="hora"
                        value={searchTerms.hora}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },
    ];

    const handleSearch = (event) => {
        const { name, value } = event.target;
        setSearchTerms({
            ...searchTerms,
            [name]: value
        });
    };

    const filteredData = data.filter(item =>
        item.tipo.toLowerCase().includes(searchTerms.tipo.toLowerCase()) &&
        item.token.toLowerCase().includes(searchTerms.token.toLowerCase()) &&
        item.cedula.toLowerCase().includes(searchTerms.cedula.toLowerCase()) &&
        item.telefono.toLowerCase().includes(searchTerms.telefono.toLowerCase()) &&
        item.banco.toLowerCase().includes(searchTerms.banco.toLowerCase()) &&
        item.codigo_banco.toLowerCase().includes(searchTerms.codigo_banco.toLowerCase()) &&
        item.monto.toLowerCase().includes(searchTerms.monto.toLowerCase()) &&
        item.referencia.toLowerCase().includes(searchTerms.referencia.toLowerCase()) &&
        item.descripcion.toLowerCase().includes(searchTerms.descripcion.toLowerCase()) &&
        item.fecha.toLowerCase().includes(searchTerms.fecha.toLowerCase()) &&
        item.hora.toLowerCase().includes(searchTerms.hora.toLowerCase())
    );

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, "data_filtrada.xlsx");
    };

    return (
        <Box sx={{ height: 700 }} className="p-4 w-full">
            <h1 className="text-2xl font-bold mb-4">Transacciones de la pasarela de pagos HerosPay</h1>
            <DataGrid rows={filteredData} columns={columns} pageSize={5} className="mb-4 mt-4" />
            <Button variant="contained" color="primary" onClick={handleExport} className="mt-4">Exportar a Excel</Button>
        </Box>
    );
};

const Vista = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <div className="container mx-auto p-4">
            <header className="mb-4">
                <h2>Bienvenido, {username}</h2>
                <Button variant="contained" color="secondary" onClick={handleLogout}>
                    Cerrar sesión
                </Button>
            </header>
            <main>
                <DataTable />
            </main>
        </div>
    );
};

export default Vista;
