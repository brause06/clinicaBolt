import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'  // Asegúrate de que la ruta de importación sea correcta
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
// Importa otros componentes según sea necesario

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App
