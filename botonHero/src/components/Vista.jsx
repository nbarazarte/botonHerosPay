import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, TextField, Tooltip } from '@mui/material';
import * as XLSX from 'xlsx';
import Layout from './Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindows, faAndroid, faApple } from '@fortawesome/free-brands-svg-icons';

const DataTable = () => {
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

    const urlApiBoton = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR_PUBLICO;
    const [url] = useState(urlApiBoton);
    const tokenApi = import.meta.env.REACT_APP_TOKEN;
    const headers = { 'Authorization': `Bearer ${tokenApi}` };
    const [data, setData] = useState([]);
    const [searchText, setSearchText] = useState('');

    const handleSearch = (event) => {
        setSearchText(event.target.value);
    };

    useEffect(() => {

        axios.get(`${url}buscar_transacciones`, { headers })
            .then(response => {
                const modifiedData = response.data.map(item => {
                    const date = new Date(item.fecha_creacion);
                    return {
                        ...item,
                        //fecha: date.toLocaleDateString(),
                        //hora: date.toLocaleTimeString(),
                    };
                });
                setData(modifiedData);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }, []);

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
            field: 'id',
            headerName: 'ID',
            flex: 0.5,
            renderHeader: renderHeaderField('ID')
        },
        {
            field: 'tipo',
            headerName: 'TIPO',
            flex: 0.6,
            renderHeader: renderHeaderField('TIPO')
        },
        {
            field: 'id debito',
            headerName: 'ID DÉBITO',
            flex: 0.8,
            renderHeader: renderHeaderField('ID DÉBITO')
        },
        {
            field: 'plan',
            headerName: 'PLAN',
            flex: 0.8,
            renderHeader: renderHeaderField('PLAN')
        },        
        {
            field: 'token',
            headerName: 'TOKEN',
            flex: 0.8,
            renderHeader: renderHeaderField('TOKEN')
        },
        {
            field: 'cedula',
            headerName: 'CÉDULA',
            flex: 0.8,
            renderHeader: renderHeaderField('CÉDULA')
        },
        {
            field: 'telefono',
            headerName: 'TELÉFONO',
            flex: 0.9,
            renderHeader: renderHeaderField('TELÉFONO')
        },
        {
            field: 'banco',
            headerName: 'BANCO',
            flex: 1.2,
            renderHeader: renderHeaderField('BANCO')
        },
        {
            field: 'monto',
            headerName: 'MONTO',
            flex: 0.8,
            renderHeader: renderHeaderField('MONTO')
        },
        {
            field: 'referencia',
            headerName: 'REF.',
            flex: 0.8,
            renderHeader: renderHeaderField('REF.')
        },
        {
            field: 'fecha',
            headerName: 'FECHA',
            flex: 0.8,
            renderHeader: renderHeaderField('FECHA')
        },
        {
            field: 'hora',
            headerName: 'HORA',
            flex: 0.8,
            renderHeader: renderHeaderField('HORA')
        },
        {
            field: 'sitio',
            headerName: 'SITIO',
            flex: 1.5,
            renderHeader: renderHeaderField('SITIO')
        },
        {
            field: 'id sitio',
            headerName: 'id sitio',
            flex: 0.8,
            renderHeader: renderHeaderField('ID SITIO')
        },
        {
            field: 'sistema_operativo',
            headerName: 'S.O.',
            flex: 1,
            renderHeader: renderHeaderField('S.O.'),
            renderCell: (params) => {
                let icon, color;
                switch (params.row.sistema_operativo) {
                    case 'Windows':
                        icon = faWindows;
                        color = '#0078D6';
                        break;
                    case 'Android':
                        icon = faAndroid;
                        color = '#3DDC84';
                        break;
                    case 'iOS':
                        icon = faApple;
                        color = '#000000';
                        break;
                    default:
                        return <b>'N/A'</b>;
                }
                return (
                    <Tooltip title={params.row.sistema_operativo}>
                        <FontAwesomeIcon style={{ color, fontSize: '1.5rem' }} icon={icon} />
                    </Tooltip>
                );
            }
        },
        {
            field: 'accion',
            headerName: 'ACCIÓN',
            flex: 1,
            renderHeader: renderHeaderField('ACCIÓN'),
            renderCell: (params) => {
                if (params.row.tipo !== 'Crédito') {
                    return (
                        <Tooltip title="Crédito Inmediato">
                            <Link
                                to={`/credito-inmediato/${params.row.id}`}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                <b>Dar Vuelto</b>
                            </Link>
                        </Tooltip>
                    );
                } else {
                    return 'N/A';
                }
            }
        },
    ];

    const filteredData = data.filter(item => {
        if (!searchText) return true;

        return Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        );
    });

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, "pasarelaHerosPay.xlsx");
    };

    return (
        <Box className="h-full pt-2">
            <div className="flex flex-col space-y-4">
                <div className="flex flex-row justify-between items-center">
                    <h1 className="text-2xl font-bold">Transacciones de la pasarela de pagos HerosPay</h1>
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
                        value={searchText}
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
                    getRowClassName={(params) => {
                        if (params.row.tipo === 'Crédito') {
                            return 'bg-orange-100 hover:bg-orange-400';
                        } else if (params.row.tipo === 'Débito') {
                            return 'bg-green-100 hover:bg-green-400';
                        }
                        return '';
                    }}
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
                        /* '& .MuiDataGrid-row': {
                            minHeight: '32px !important',
                            maxHeight: '42px !important',
                            '&:nth-of-type(even)': {
                                backgroundColor: '#fafafa',
                            },
                            '&:hover': {
                                backgroundColor: '#f5f5f5',
                                transition: 'background-color 0.2s',
                            },
                        }, */
                        '& .row-ci': {
                            backgroundColor: '#FFA500', // naranja
                            '&:hover': {
                                backgroundColor: '#FF8C00', // naranja oscuro
                            },
                        },
                        '& .row-di': {
                            backgroundColor: '#32CD32', // verde
                            '&:hover': {
                                backgroundColor: '#228B22', // verde oscuro
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

const Vista = () => {

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

export default Vista;
