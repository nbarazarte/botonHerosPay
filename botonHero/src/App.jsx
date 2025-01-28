import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas as solidIcons } from '@fortawesome/free-solid-svg-icons'
import { fab as brandIcons } from '@fortawesome/free-brands-svg-icons'
import { far as regularIcons } from '@fortawesome/free-regular-svg-icons'
library.add(solidIcons, brandIcons, regularIcons) // Añade conjuntos de íconos 
import CreditoInmediato from './components/CreditoInmediato'
import DebitoInmediato from './components/DebitoInmediato'

function App() {

  return (
    <>
      {/* <CreditoInmediato /> */}
      <DebitoInmediato />
    </>
  )
}

export default App
