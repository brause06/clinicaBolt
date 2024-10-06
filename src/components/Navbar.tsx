import React from 'react'
import { Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import RealTimeNotifications from './RealTimeNotifications'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Activity size={24} />
          <span className="text-xl font-bold">FisioClínica</span>
        </Link>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <Link to="/dashboard" className="hover:text-blue-200 transition duration-300">
                Dashboard
              </Link>
              <RealTimeNotifications />
            </>
          )}
          {user ? (
            <button onClick={logout} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
              Cerrar Sesión
            </button>
          ) : (
            <>
              <Link to="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="bg-transparent hover:bg-blue-500 text-white font-semibold hover:text-white py-2 px-4 border border-white hover:border-transparent rounded transition duration-300">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar