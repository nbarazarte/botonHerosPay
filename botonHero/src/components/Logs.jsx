import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import logo from '../assets/images/logo_heros.png';
import avatar from '../assets/images/logo_heros.jpg';
import CryptoJS from 'crypto-js';

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

    const columns = [
        {
            field: 'id', headerName: 'ID', width: 50, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>ID</div>
                </Box>
            )
        },
        {
            field: 'error_code', headerName: 'ERROR_CODE', width: 150, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>ERROR_CODE</div>
                    <TextField
                        name="error_code"
                        value={searchTerms.error_code}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },
        {
            field: 'error_message', headerName: 'ERROR_MESSAGE', width: 150, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>ERROR_MESSAGE</div>
                    <TextField
                        name="error_message"
                        value={searchTerms.error_message}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },
        {
            field: 'error_name', headerName: 'ERROR_NAME', width: 170, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>ERROR_NAME</div>
                    <TextField
                        name="error_name"
                        value={searchTerms.error_name}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },
        {
            field: 'url', headerName: 'URL', width: 300, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>URL</div>
                    <TextField
                        name="url"
                        value={searchTerms.url}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },
        {
            field: 'api', headerName: 'API', width: 100, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>API</div>
                    <TextField
                        name="api"
                        value={searchTerms.api}
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
            <div className="flex flex-row justify-between items-center">
                <h1 className="text-2xl font-bold">Logs de la pasarela de pagos HerosPay</h1>
                <div className='flex justify-end items-end'>
                    <Button variant="contained" color="primary" onClick={handleExport} className="mt-4">Exportar a Excel</Button>
                </div>
            </div>
            <DataGrid rows={filteredData} columns={columns} pageSize={5} className="w-full mb-4 mt-4" />
        </Box>

    );
};

const Logs = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const user = {
        name: 'Herosnet',
        email: 'suscripciones@heros-technology.com',
        imageUrl: { avatar },
    }
    const navigation = [
        { name: 'Dashboard', href: '#', current: true },
        { name: 'Team', href: '#', current: false },
        { name: 'Projects', href: '#', current: false },
        { name: 'Calendar', href: '#', current: false },
        { name: 'Reports', href: '#', current: false },
    ]

    const userNavigation = [
        { name: 'Vista', href: '/vista', onclick: '' },
        { name: 'Logs', href: '/logs', onclick: '' },
        { name: 'Salir', href: '#', onclick: handleLogout },
    ]

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    return (
        <>

            <div className="min-h-full ">
                <Disclosure as="nav" className="bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center">
                                <div className="shrink-0">
                                    <img
                                        alt="Heros Technology"
                                        src={logo}
                                        className=""
                                    />
                                </div>
                                {/*                                 <div className="hidden md:block">
                                    <div className="ml-10 flex items-baseline space-x-4">
                                        {navigation.map((item) => (
                                            <a
                                                key={item.name}
                                                href={item.href}
                                                aria-current={item.current ? 'page' : undefined}
                                                className={classNames(
                                                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                                    'rounded-md px-3 py-2 text-sm font-medium',
                                                )}
                                            >
                                                {item.name}
                                            </a>
                                        ))}
                                    </div>
                                </div> */}
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-4 flex items-center md:ml-6">
                                    <button
                                        type="button"
                                        className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                                    >
                                        <span className="absolute -inset-1.5" />
                                        <span className="sr-only">View notifications</span>
                                        {/* <BellIcon aria-hidden="true" className="size-6" /> */}
                                        {username}
                                    </button>

                                    {/* Profile dropdown */}
                                    <Menu as="div" className="relative ml-3">
                                        <div>
                                            <MenuButton className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                                                <span className="absolute -inset-1.5" />
                                                <span className="sr-only">Open user menu</span>
                                                <img alt="" src={avatar} className="size-8 rounded-full" />
                                            </MenuButton>
                                        </div>
                                        <MenuItems
                                            transition
                                            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                        >
                                            {userNavigation.map((item) => (
                                                <MenuItem key={item.name}>
                                                    <a
                                                        href={item.href}
                                                        onClick={item.onclick}
                                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                                                    >
                                                        {item.name}
                                                    </a>
                                                </MenuItem>
                                            ))}
                                        </MenuItems>
                                    </Menu>
                                </div>
                            </div>
                            <div className="-mr-2 flex md:hidden">
                                {/* Mobile menu button */}
                                <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Open main menu</span>
                                    <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                                    <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
                                </DisclosureButton>
                            </div>
                        </div>
                    </div>

                    <DisclosurePanel className="md:hidden">
                        {/*                         <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                            {navigation.map((item) => (
                                <DisclosureButton
                                    key={item.name}
                                    as="a"
                                    href={item.href}
                                    aria-current={item.current ? 'page' : undefined}
                                    className={classNames(
                                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                        'block rounded-md px-3 py-2 text-base font-medium',
                                    )}
                                >
                                    {item.name}
                                </DisclosureButton>
                            ))}
                        </div> */}
                        <div className="border-t border-gray-700 pt-4 pb-3">
                            <div className="flex items-center px-5">
                                <div className="shrink-0">
                                    <img alt="" src={avatar} className="size-10 rounded-full" />
                                </div>
                                <div className="ml-3">
                                    <div className="text-base/5 font-medium text-white">{user.name}</div>
                                    <div className="text-sm font-medium text-gray-400">{user.email}</div>
                                </div>
                                <button
                                    type="button"
                                    className="relative ml-auto shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                                >
                                    <span className="absolute -inset-1.5" />
                                    <span className="sr-only">View notifications</span>
                                    {/* <BellIcon aria-hidden="true" className="size-6" /> */}
                                </button>
                            </div>
                            <div className="mt-3 space-y-1 px-2">
                                {userNavigation.map((item) => (
                                    <DisclosureButton
                                        key={item.name}
                                        as="a"
                                        href={item.href}
                                        onClick={item.onclick}
                                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                                    >
                                        {item.name}
                                    </DisclosureButton>
                                ))}
                            </div>
                        </div>
                    </DisclosurePanel>
                </Disclosure>

                <main>
                    <div className=" sm:px-6 lg:px-8">
                        <DataTable />
                    </div>
                </main>
            </div>
        </>
    )

};

export default Logs;
