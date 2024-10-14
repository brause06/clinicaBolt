import React, { useState } from 'react'
import { Clipboard, Plus } from 'lucide-react'

// Añade una interfaz para el tipo de tratamiento
interface Treatment {
  id: number;
  name: string;
  duration: string;
  frequency: string;
}

interface TreatmentPlanProps {
  patientId: string;
}

const TreatmentPlan: React.FC<TreatmentPlanProps> = ({ patientId }) => {
  const [treatments, setTreatments] = useState<Treatment[]>([
    { id: 1, name: 'Terapia manual', duration: '30 minutos', frequency: '2 veces por semana' },
    { id: 2, name: 'Ejercicios de fortalecimiento', duration: '45 minutos', frequency: '3 veces por semana' },
  ])

  const [newTreatment, setNewTreatment] = useState({ name: '', duration: '', frequency: '' })

  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTreatment.name && newTreatment.duration && newTreatment.frequency) {
      setTreatments([...treatments, { id: Date.now(), ...newTreatment }])
      setNewTreatment({ name: '', duration: '', frequency: '' })
    }
  }

  // Puedes usar patientId para cargar los tratamientos específicos del paciente
  // Por ejemplo:
  // useEffect(() => {
  //   loadTreatmentsForPatient(patientId);
  // }, [patientId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Plan de Tratamiento para Paciente {patientId}</h2>
      <div className="space-y-4 mb-6">
        {treatments.map((treatment) => (
          <div key={treatment.id} className="border-b pb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clipboard className="w-5 h-5 text-blue-500" />
              <span className="font-medium">{treatment.name}</span>
            </div>
            <p><strong>Duración:</strong> {treatment.duration}</p>
            <p><strong>Frecuencia:</strong> {treatment.frequency}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddTreatment} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre del tratamiento"
          value={newTreatment.name}
          onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })}
          className="w-full border rounded-md p-2"
        />
        <input
          type="text"
          placeholder="Duración"
          value={newTreatment.duration}
          onChange={(e) => setNewTreatment({ ...newTreatment, duration: e.target.value })}
          className="w-full border rounded-md p-2"
        />
        <input
          type="text"
          placeholder="Frecuencia"
          value={newTreatment.frequency}
          onChange={(e) => setNewTreatment({ ...newTreatment, frequency: e.target.value })}
          className="w-full border rounded-md p-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Agregar Tratamiento
        </button>
      </form>
    </div>
  )
}

export default TreatmentPlan
