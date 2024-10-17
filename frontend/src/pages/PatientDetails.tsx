import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, FileText, Activity } from 'lucide-react'
import axios from 'axios'
import ExercisePlan from '../components/ExercisePlan'

interface PatientDetails {
  id: number
  name: string
  age: number
  condition: string
  lastAppointment: string
  nextAppointment: string
  treatmentPlan: string
}

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>()
  const [patient, setPatient] = useState<PatientDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`/api/pacientes/${id}/details`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPatient(response.data)
      } catch (error) {
        console.error('Error fetching patient details:', error)
        setError('Error al cargar los detalles del paciente')
      } finally {
        setLoading(false)
      }
    }

    fetchPatientDetails()
  }, [id])

  if (loading) return <div>Cargando...</div>
  if (error) return <div>{error}</div>
  if (!patient) return <div>No se encontró el paciente</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/dashboard" className="flex items-center text-blue-500 hover:underline mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a la lista de pacientes
      </Link>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Detalles del Paciente</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p><strong>Nombre:</strong> {patient.name}</p>
            <p><strong>Edad:</strong> {patient.age}</p>
            <p><strong>Condición:</strong> {patient.condition}</p>
          </div>
          <div>
            <p><strong>Última cita:</strong> {patient.lastAppointment}</p>
            <p><strong>Próxima cita:</strong> {patient.nextAppointment}</p>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Plan de Tratamiento</h3>
          <p>{patient.treatmentPlan}</p>
        </div>
        <div className="mt-6 flex space-x-4">
          <Link to={`/patient/${id}/appointments`} className="flex items-center text-blue-500 hover:underline">
            <Calendar className="w-4 h-4 mr-2" /> Ver historial de citas
          </Link>
          <Link to={`/patient/${id}/medical-history`} className="flex items-center text-blue-500 hover:underline">
            <FileText className="w-4 h-4 mr-2" /> Ver historial médico
          </Link>
          <Link to={`/patient/${id}/exercises`} className="flex items-center text-blue-500 hover:underline">
            <Activity className="w-4 h-4 mr-2" /> Ver plan de ejercicios
          </Link>
        </div>
        {id && <ExercisePlan patientId={parseInt(id, 10)} />}
      </div>
    </div>
  )
}

export default PatientDetails
