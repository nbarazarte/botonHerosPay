import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Configura el token en `localStorage` 
//localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6Ik5lZWwgQmFyYXphcnRlIiwiaWF0IjoxNzM3NDc4ODU0LCJleHAiOjE3NjkwMzY0NTR9.HPIBnUOK6OSwirBw5DXSZCGGKffGkEXjSTgU7abThQs');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


