import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

interface Patient {
  id: number;
  name: string;
  age: number;
  condition: string;
}

const EditPatient = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`/api/pacientes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPatient(response.data)
      } catch (error) {
        console.error('Error fetching patient:', error)
        setError('Error al cargar los datos del paciente')
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient) return

    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/pacientes/${id}`, patient, {
        headers: { Authorization: `Bearer ${token}` }
      })
      navigate('/dashboard', { state: { message: 'Paciente actualizado exitosamente' } })
    } catch (error) {
      console.error('Error updating patient:', error)
      setError('Error al actualizar el paciente')
    }
  }

  if (loading) return <div>Cargando...</div>
  if (error) return <div>{error}</div>
  if (!patient) return <div>No se encontró el paciente</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Editar Paciente</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-600">Nombre Completo</label>
            <input
              type="text"
              id="name"
              value={patient.name}
              onChange={(e) => setPatient({ ...patient, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="age" className="block mb-2 text-sm font-medium text-gray-600">Edad</label>
            <input
              type="number"
              id="age"
              value={patient.age}
              onChange={(e) => setPatient({ ...patient, age: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="condition" className="block mb-2 text-sm font-medium text-gray-600">Condición</label>
            <input
              type="text"
              id="condition"
              value={patient.condition}
              onChange={(e) => setPatient({ ...patient, condition: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditPatient