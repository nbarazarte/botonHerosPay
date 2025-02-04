import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const DataTable = () => {

    const urlApiBoton = import.meta.env.REACT_APP_URL_API_BOTON_LOCAL;
    const [url, setUrl] = useState(urlApiBoton);
    const tokenApi = import.meta.env.REACT_APP_TOKEN;
    const headers = { 'Authorization': `Bearer ${tokenApi}` };
    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');

    /*     useEffect(() => {
            axios.get(`${url}buscar_transacciones`, { headers })
                .then(response => {
                    //console.log('Data fetched: ', response.data);
                    setData(response.data);
                })
                .catch(error => {
                    console.error('Error fetching data: ', error);
                });
        }, []);
     */

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
        { field: 'id', headerName: 'ID', width: 50 },
        { field: 'tipo', headerName: 'TIPO', width: 150 },
        { field: 'token', headerName: 'TOKEN', width: 90 },
        { field: 'cedula', headerName: 'CÉDULA', width: 100 },
        { field: 'telefono', headerName: 'TELÉFONO', width: 120 },
        { field: 'banco', headerName: 'BANCO', width: 220 },
        { field: 'codigo_banco', headerName: 'CÓDIGO', width: 90 },
        { field: 'monto', headerName: 'MONTO', width: 90 },
        { field: 'referencia', headerName: 'REFERENCIA', width: 120 },
        { field: 'descripcion', headerName: 'DESCRIPCIÓN', width: 150 },
        { field: 'fecha', headerName: 'FECHA', width: 100 },
        { field: 'hora', headerName: 'HORA', width: 100 },
    ];

    const handleSearch = (event) => {
        setSearch(event.target.value);
    };

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, "data.xlsx");
    };

    const filteredData = data.filter(item =>
        item.tipo.toLowerCase().includes(search.toLowerCase()) ||
        item.token.toLowerCase().includes(search.toLowerCase()) ||
        item.cedula.toLowerCase().includes(search.toLowerCase()) ||
        item.telefono.toLowerCase().includes(search.toLowerCase()) ||
        item.banco.toLowerCase().includes(search.toLowerCase()) ||
        item.codigo_banco.toLowerCase().includes(search.toLowerCase()) ||
        item.monto.toLowerCase().includes(search.toLowerCase()) ||
        item.referencia.toLowerCase().includes(search.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(search.toLowerCase()) ||
        item.fecha.toLowerCase().includes(search.toLowerCase()) ||
        item.hora.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box sx={{ height: 700 }} className="p-4 w-full">

            <h1 className="text-2xl font-bold mb-4">Transacciones de la pasarela de pagos HerosPay</h1>
            <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Buscar..."
                className="mb-4 p-2 border rounded w-full"
            />
            <DataGrid rows={filteredData} columns={columns} pageSize={5} className="mb-4" />
            <Button variant="contained" color="primary" onClick={handleExport} className="mt-4">Exportar a Excel</Button>
        </Box>
    );
};

const Vista = () => {
    return (
        <div className="container mx-auto p-4">
            <DataTable />
        </div>
    );
}

export default Vista;
