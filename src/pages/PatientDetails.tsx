import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, FileText, Activity } from 'lucide-react'

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>()
  // Aquí normalmente cargarías los detalles del paciente desde una API o base de datos
  const patient = {
    id: Number(id),
    name: 'Ana Martínez',
    age: 35,
    condition: 'Lumbalgia',
    lastAppointment: '2023-04-15',
    nextAppointment: '2023-05-01',
    treatmentPlan: 'Ejercicios de fortalecimiento lumbar y terapia manual',
  }

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
      </div>
    </div>
  )
}

export default PatientDetails