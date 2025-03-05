import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, TextField } from '@mui/material';
import * as XLSX from 'xlsx';
import CryptoJS from 'crypto-js';
import Layout from './Layout';

const DataTable = () => {
    const tokenCommerce = import.meta.env.REACT_APP_TOKEN_COMMERCE;
    const urlApiBoton = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR_PUBLICO;
    const urlMiBancoBcv = import.meta.env.REACT_APP_URL_API_MIBANCO_BCV;
    const [url, setUrl] = useState(urlApiBoton);
    const tokenApi = import.meta.env.REACT_APP_TOKEN;
    const headers = { 'Authorization': `Bearer ${tokenApi}` };
    const [data, setData] = useState([]);
    const [searchTerms, setSearchTerms] = useState({
        error_code: '',
        error_message: '',
        error_name: '',
        url: '',
        api: '',
        hora: ''
    });

    const headerBoxStyle = {
        padding: '2px',
        '& .header-title': {
            fontWeight: 600,
            color: '#1976d2',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: '1'
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            window.location.reload();
        }, 300000); // 60000 ms = 60 segundos, puse 5 minutos

        return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
    }, []);

    useEffect(() => {

        const fetchLogs = async () => {

            try {

                function obtenerFechaValor() {
                    const fechaActual = new Date();
                    const año = fechaActual.getFullYear();
                    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
                    const dia = String(fechaActual.getDate()).padStart(2, '0');
                    return `${año}-${mes}-${dia}`;
                }

                const fechaValor = obtenerFechaValor();
                const dataToHash = `${fechaValor}USD`;
                const headersMiBanco = headersR4(dataToHash)

                const postData = {
                    Moneda: "USD",
                    Fechavalor: fechaValor
                }

                const tasaBcv = await axios.post(`${urlMiBancoBcv}`, postData, { headers: headersMiBanco });

            } catch (error) {
                console.error('Error fetching data: ', error);

                function obtenerFechaValor() {
                    const fechaActual = new Date();
                    const año = fechaActual.getFullYear();
                    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
                    const dia = String(fechaActual.getDate()).padStart(2, '0');
                    const horas = String(fechaActual.getHours()).padStart(2, '0');
                    const minutos = String(fechaActual.getMinutes()).padStart(2, '0');
                    const segundos = String(fechaActual.getSeconds()).padStart(2, '0');
                    //return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
                    return `${año}-${mes}-${dia} ${horas}:${minutos}`;
                }

                const hora = obtenerFechaValor();
                /*                 // Verifica si ya se ha guardado un error similar antes de guardarlo
                                const duplicateCheck = await axios.get(`${url}error-logs?hora=${hora}`, { headers });
                                //console.log(duplicateCheck);
                
                                if (duplicateCheck.data.length === 0) {
                                    await axios.post(`${url}error-logs`, {
                                        error_code: error.code,
                                        error_message: error.message,
                                        error_name: error.name,
                                        url: error.config.url,
                                        api: 'R4',
                                        hora: hora
                                    }, { headers });
                                } */

                await axios.post(`${url}error-logs`, {
                    error_code: error.code,
                    error_message: error.message,
                    error_name: error.name,
                    url: error.config.url,
                    api: 'R4',
                    hora: hora
                }, { headers });
            }

        }
        fetchLogs();

        axios.get(`${url}buscar_logs`, { headers })
            .then(response => {
                const modifiedData = response.data.map(item => {
                    const date = new Date(item.hora);
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

    const headersR4 = (dataToHash) => {

        const hash2 = CryptoJS.HmacSHA256(dataToHash, tokenCommerce);
        const hmac2 = hash2.toString(CryptoJS.enc.Hex);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `${hmac2}`,
            'Commerce': `${tokenCommerce}`
        };

        return headers
    }

    const renderHeaderField = (title) => () => (
        <Box
            className="flex flex-col items-center"
            sx={headerBoxStyle}
        >
            <div className="header-title">{title}</div>
        </Box>
    );

    const columns = [
        {
            field: 'id', headerName: 'ID', flex: 0.5, renderHeader: renderHeaderField('ID')
        },
        {
            field: 'error_code', headerName: 'ERROR_CODE', flex: 0.6, renderHeader: renderHeaderField('ERROR_CODE')
        },
        {
            field: 'error_message', headerName: 'ERROR_MESSAGE', flex: 0.9, renderHeader: renderHeaderField('ERROR_MESSAGE')
        },
        {
            field: 'error_name', headerName: 'ERROR_NAME', flex: 0.8, renderHeader: renderHeaderField('ERROR_NAME')
        },
        {
            field: 'url', headerName: 'URL', flex: 0.8, renderHeader: renderHeaderField('URL')
        },
        {
            field: 'api', headerName: 'API', flex: 0.9, renderHeader: renderHeaderField('API')
        },
        {
            field: 'hora', headerName: 'HORA', flex: 1.2, renderHeader: renderHeaderField('HORA')
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
        item.error_code.toLowerCase().includes(searchTerms.error_code.toLowerCase()) &&
        item.error_message.toLowerCase().includes(searchTerms.error_message.toLowerCase()) &&
        item.error_name.toLowerCase().includes(searchTerms.error_name.toLowerCase()) &&
        item.url.toLowerCase().includes(searchTerms.url.toLowerCase()) &&
        item.api.toLowerCase().includes(searchTerms.api.toLowerCase()) &&
        item.hora.toLowerCase().includes(searchTerms.hora.toLowerCase())
    );

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, "data_filtrada.xlsx");
    };

    return (
        <Box className="h-full pt-2">
            <div className="flex flex-col space-y-4">
                <div className="flex flex-row justify-between items-center">
                    <h1 className="text-2xl font-bold">Logs de la pasarela de pagos HerosPay</h1>
                    <div className='flex justify-end items-end'>
                        <Button variant="contained" color="primary" onClick={handleExport} className="mt-4">Exportar a Excel</Button>
                    </div>
                </div>
                <div className="flex w-full">
                    <TextField
                        placeholder="Buscar en todas las columnas"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchTerms.error_code}
                        onChange={handleSearch}
                        sx={{
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#e0e0e0',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#1976d2',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#1976d2',
                                },
                            },
                        }}
                    />
                </div>
            </div>
            <Box sx={{
                height: 'calc(100vh - 200px)',
                width: '100%',
                marginTop: 2,
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    pageSize={15}
                    rowsPerPageOptions={[15, 30, 50]}
                    className="w-full"
                    disableSelectionOnClick
                    disableColumnMenu
                    disableColumnSelector
                    disableColumnFilter
                    sortingMode="none"
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-main': {
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        },
                        '& .MuiDataGrid-cell': {
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            borderBottom: 'none',
                            '&:focus': {
                                outline: 'none',
                            },
                        },
                        '& .MuiDataGrid-row': {
                            minHeight: '32px !important',
                            maxHeight: '42px !important',
                            '&:nth-of-type(even)': {
                                backgroundColor: '#fafafa',
                            },
                            '&:hover': {
                                backgroundColor: '#f5f5f5',
                                transition: 'background-color 0.2s',
                            },
                        },
                        '& .MuiDataGrid-virtualScrollerRenderZone': {
                            '& > :first-child': {
                                marginTop: 0,
                            },
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#fff',
                            minHeight: '45px !important',
                            maxHeight: '45px !important',
                            borderBottom: 'none',
                            lineHeight: '45px',
                        },
                        '& .MuiDataGrid-columnHeader': {
                            height: '45px !important',
                            '& .MuiDataGrid-columnHeaderTitleContainer': {
                                padding: 0,
                            },
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        },
                        '& .MuiDataGrid-footerContainer': {
                            backgroundColor: '#fff',
                            minHeight: '40px',
                            borderTop: 'none',
                        },
                        '& .MuiTablePagination-root': {
                            fontSize: '0.75rem',
                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                fontSize: '0.75rem',
                                marginBottom: 0,
                            },
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

const Logs = () => {

    return (
        <div className="min-h-full ">
            <Layout />
            <main>
                <div className=" sm:px-6 lg:px-8">
                    <DataTable />
                </div>
            </main>
        </div>
    )
};

export default Logs;
