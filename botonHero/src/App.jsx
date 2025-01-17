import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CreditoInmediato from './components/CreditoInmediato'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <CreditoInmediato />
    </>
  )
}

export default App
