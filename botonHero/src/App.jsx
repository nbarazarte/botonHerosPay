import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga';
import './styles.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas as solidIcons } from '@fortawesome/free-solid-svg-icons';
import { fab as brandIcons } from '@fortawesome/free-brands-svg-icons';
import { far as regularIcons } from '@fortawesome/free-regular-svg-icons';
import CreditoInmediato from './components/CreditoInmediato';
import DebitoInmediato from './components/DebitoInmediato';
import Vista from './components/Vista';
import Logs from './components/Logs';
import Login from './components/Login';
import Register from './components/Register';
library.add(solidIcons, brandIcons, regularIcons); // Añade conjuntos de íconos

// Inicializa Google Analytics con tu ID de medición
ReactGA.initialize(import.meta.env.REACT_APP_URL_GOOGLE_ANALITICS);

const RouteChangeTracker = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.pageview(location.pathname + location.search);
  }, [location]);

  return null;
};

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router basename="/">
      <RouteChangeTracker />  {/* Este componente rastrea los cambios de ruta */}
      <div className=''>
        {/* <nav className='flex w-full justify-center'>
          <ul className="menu flex justify-center">
            <li className='bg-naranjaMove text-white p-2 m-2 rounded-lg'>
              <Link to="/debito-inmediato">Débito Inmediato</Link>
            </li>
            <li className='bg-naranjaMove text-white p-2 m-2 rounded-lg'>
              <Link to="/credito-inmediato">Crédito Inmediato</Link>
            </li>
            <li className='bg-naranjaMove text-white p-2 m-2 rounded-lg'>
              <Link to="/login">Login</Link>
            </li>
            <li className='bg-naranjaMove text-white p-2 m-2 rounded-lg'>
              <Link to="/register">Register</Link>
            </li>
          </ul>
        </nav> */}

        <Routes>
          <Route path="/" element={<DebitoInmediato />} />
          <Route path="/credito-inmediato/:id" element={<CreditoInmediato />} />
          <Route path="/debito-inmediato/:idSitio/:plan/:montoPlan" element={<DebitoInmediato />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vista" element={token ? <Vista /> : <Navigate to="/login" />} />
          <Route path="/logs" element={token ? <Logs /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
