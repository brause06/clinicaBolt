import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Bienvenido a FisioClínica</h1>
      <p className="text-xl mb-4">Mejoramos tu experiencia en fisioterapia con tecnología avanzada.</p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Para Pacientes</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Accede a tu historial clínico</li>
            <li>Programa citas en línea</li>
            <li>Visualiza ejercicios personalizados</li>
            <li>Comunícate con tu fisioterapeuta</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Para Fisioterapeutas</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Gestiona tus pacientes</li>
            <li>Crea planes de tratamiento</li>
            <li>Administra tu agenda de citas</li>
            <li>Colabora con otros profesionales</li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center">
        {isAuthenticated ? (
          <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300 inline-block">
            Ir al Dashboard
          </Link>
        ) : (
          <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300 inline-block">
            Comienza Ahora
          </Link>
        )}
      </div>
    </div>
  )
}

export default Home