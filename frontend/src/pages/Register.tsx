import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/authService'
import { UserRole, User } from '../types/user'
import { Omit } from 'utility-types'
import axios from 'axios'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<UserRole>(UserRole.PACIENTE)
  const [error, setError] = useState('')
  const [age, setAge] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const userData: Omit<User, 'id'> = {
        username: name,
        email,
        password,
        role: userType,
        age: userType === UserRole.PACIENTE && age ? parseInt(age) : undefined
      }
      const response = await register(userData)
      console.log('Registro exitoso', response)
      navigate('/login')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(`Error de registro: ${err.response.data.message}`)
        console.error('Detalles del error:', err.response.data)
      } else {
        setError('Error de registro. Por favor, inténtalo de nuevo.')
      }
      console.error('Error de registro completo:', err)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)

  return (
<div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-600">Nombre Completo</label>
            <input
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={handleNameChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-600">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-600">Contraseña</label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-600">Tipo de Usuario</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="patient"
                  checked={userType === UserRole.PACIENTE}
                  onChange={() => setUserType(UserRole.PACIENTE)}
                  className="mr-2"
                />
                Paciente
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="physiotherapist"
                  checked={userType === UserRole.FISIOTERAPEUTA}
                  onChange={() => setUserType(UserRole.FISIOTERAPEUTA)}
                  className="mr-2"
                />
                Fisioterapeuta
              </label>
            </div>
          </div>
          {userType === UserRole.PACIENTE && (
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-600">Edad</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300">
            Registrarse
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta? <Link to="/login" className="text-blue-600 hover:underline">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
