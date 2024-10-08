import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'  // Asegúrate de que la ruta de importación sea correcta
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
// Importa otros componentes según sea necesario

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Agrega otras rutas según sea necesario */}
    </Routes>
  )
}

export default App