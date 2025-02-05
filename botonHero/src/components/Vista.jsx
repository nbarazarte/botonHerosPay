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

const DataTable = () => {
    const urlApiBoton = import.meta.env.REACT_APP_URL_API_BOTON_SERVIDOR_PUBLICO;
    const [url, setUrl] = useState(urlApiBoton);
    const tokenApi = import.meta.env.REACT_APP_TOKEN;
    const headers = { 'Authorization': `Bearer ${tokenApi}` };
    const [data, setData] = useState([]);
    const [searchTerms, setSearchTerms] = useState({
        nombre: '',
        identificador: '',
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
            field: 'id', headerName: 'ID', width: 50, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>ID</div>
                </Box>
            )
        },

        {
            field: 'tipo', headerName: 'TIPO', width: 50, renderHeader: () => (
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
            field: 'token', headerName: 'TOKEN', width: 100, renderHeader: () => (
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
            field: 'cedula', headerName: 'CÉDULA', width: 120, renderHeader: () => (
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
            field: 'telefono', headerName: 'TELÉFONO', width: 120, renderHeader: () => (
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
        /*         {
                    field: 'codigo_banco', headerName: 'COD.', width: 90, renderHeader: () => (
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
                }, */
        {
            field: 'monto', headerName: 'MONTO', width: 100, renderHeader: () => (
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
        {
            field: 'nombre', headerName: 'NOMBRE', width: 220, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>SITIO</div>
                    <TextField
                        name="nombre"
                        value={searchTerms.nombre}
                        onChange={handleSearch}
                        placeholder=""
                        variant="standard"
                        fullWidth
                    />
                </Box>
            )
        },

        {
            field: 'identificador', headerName: 'IDENTIFICADOR', width: 130, renderHeader: () => (
                <Box className="flex flex-col items-center">
                    <div>IDENTIFICADOR</div>
                    <TextField
                        name="identificador"
                        value={searchTerms.identificador}
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
        item.nombre.toLowerCase().includes(searchTerms.nombre.toLowerCase()) &&
        item.identificador.toLowerCase().includes(searchTerms.identificador.toLowerCase()) &&
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

        <Box className="h-full pt-2">
            <div className="flex flex-row justify-between items-center">
                <h1 className="text-2xl font-bold">Transacciones de la pasarela de pagos HerosPay</h1>
                <div className='flex justify-end items-end'>
                    <Button variant="contained" color="primary" onClick={handleExport} className="mt-4">Exportar a Excel</Button>
                </div>
            </div>
            <DataGrid rows={filteredData} columns={columns} pageSize={5} className="w-full mb-4 mt-4" />
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
        /*     { name: 'Your Profile', href: '#', onclick:'' },
            { name: 'Settings', href: '#',onclick:'' }, */
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

export default Vista;
