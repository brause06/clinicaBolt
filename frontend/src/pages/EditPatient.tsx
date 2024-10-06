import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

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

  useEffect(() => {
    // Simular la carga de datos del paciente
    // En una aplicación real, esto sería una llamada a una API
    const mockPatient: Patient = {
      id: Number(id),
      name: 'Ana Martínez',
      age: 35,
      condition: 'Lumbalgia',
    }
    setPatient(mockPatient)
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para actualizar el paciente en la base de datos
    console.log('Paciente actualizado:', patient)
    navigate(`/patient/${id}`)
  }

  if (!patient) {
    return <div>Cargando...</div>
  }

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
              onChange={(e) => setPatient({ ...patient, age: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
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
          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300">
            Actualizar Paciente
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditPatient