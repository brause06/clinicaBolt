import React, { useState, useEffect } from 'react'
import api from '../api/api'
import { Patient } from '../types/patient'
import { User } from '../types/user' // Asegúrate de tener este tipo definido

interface PatientDetailsProps {
  patientId: number;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ patientId }) => {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientResponse = await api.get(`/pacientes/${patientId}`)
        setPatient(patientResponse.data)
        console.log(patientResponse.data)

        // Obtener datos del usuario asociado
        if (patientResponse.data.userId) {
          const userResponse = await api.get(`/usuarios/${patientResponse.data.userId}`)
          setUser(userResponse.data)
          console.log(userResponse.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [patientId])

  if (!patient) return <div>Cargando...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Detalles del Paciente</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            {user && user.profileImageUrl && (
              <img 
                src={user.profileImageUrl} 
                alt={`Foto de ${patient.name}`} 
                className="w-32 h-32 rounded-full mb-4"
              />
            )}
            <p><strong>Nombre:</strong> {patient.name}</p>
            <p><strong>Edad:</strong> {patient.age}</p>
            <p><strong>Condición:</strong> {patient.condition}</p>
          </div>
          <div>
            <p><strong>Última cita:</strong> {patient.lastAppointment}</p>
          </div>
        </div>
        {/* Agrega más detalles del paciente aquí */}
      </div>
    </div>
  )
}

export default PatientDetails
