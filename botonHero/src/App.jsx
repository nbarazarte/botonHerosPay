import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import './styles.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas as solidIcons } from '@fortawesome/free-solid-svg-icons';
import { fab as brandIcons } from '@fortawesome/free-brands-svg-icons';
import { far as regularIcons } from '@fortawesome/free-regular-svg-icons';
library.add(solidIcons, brandIcons, regularIcons); // Añade conjuntos de íconos
import CreditoInmediato from './components/CreditoInmediato';
import DebitoInmediato from './components/DebitoInmediato';

function App() {
  return (
    <Router basename="/boton">
      <div>
        <nav>
          <ul className="menu">
            <li>
              <Link to="/credito-inmediato">Crédito Inmediato</Link>
            </li>
            <li>
              <Link to="/debito-inmediato">Débito Inmediato</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<DebitoInmediato />} />
          <Route path="/credito-inmediato" element={<CreditoInmediato />} />
          <Route path="/debito-inmediato" element={<DebitoInmediato />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
