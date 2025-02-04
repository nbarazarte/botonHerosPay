import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './styles.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas as solidIcons } from '@fortawesome/free-solid-svg-icons';
import { fab as brandIcons } from '@fortawesome/free-brands-svg-icons';
import { far as regularIcons } from '@fortawesome/free-regular-svg-icons';
library.add(solidIcons, brandIcons, regularIcons); // Añade conjuntos de íconos
import CreditoInmediato from './components/CreditoInmediato';
import DebitoInmediato from './components/DebitoInmediato';
import Vista from './components/Vista';

function App() {
  return (
    <Router basename="/">{/* /boton */}
      <div className=''>
        {/*         <nav className='flex w-full justify-center'>
          <ul className="menu flex justify-center">
            <li className='bg-naranjaMove text-white p-2 m-2 rounded-lg'>
              <Link to="/debito-inmediato">Débito Inmediato</Link>
            </li>
            <li className='bg-naranjaMove text-white p-2 m-2 rounded-lg'>
              <Link to="/credito-inmediato">Crédito Inmediato</Link>
            </li>
          </ul>
        </nav> */}

        <Routes>
          <Route path="/" element={<DebitoInmediato />} />
          <Route path="/credito-inmediato" element={<CreditoInmediato />} />
          <Route path="/debito-inmediato" element={<DebitoInmediato />} />
          <Route path="/vista" element={<Vista />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
