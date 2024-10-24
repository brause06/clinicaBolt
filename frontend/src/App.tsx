import React from 'react'
import { Routes, Route, useParams, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'  // Asegúrate de que la ruta de importación sea correcta
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import EditPatient from './pages/EditPatient'  // Importa el componente EditPatient
import AddPatient from './pages/AddPatient'  // Importa el nuevo componente
import 'react-toastify/dist/ReactToastify.css';
import PatientDetails from './pages/PatientDetails'
// Importa otros componentes según sea necesario
import PageTransition from './components/PageTransition'
import Layout from './components/Layout' // Importa el layout

const App = () => {
  const location = useLocation();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/patient/:id/edit" element={<EditPatient />} />
          <Route path="/add-patient" element={<AddPatient />} />
          <Route path="/patient/:id" element={<PatientDetails patientId={Number(useParams().id)} />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}

export default App
