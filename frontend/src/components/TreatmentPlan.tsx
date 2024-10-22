import React, { useState, useEffect } from 'react'
import { Clipboard, Plus } from 'lucide-react'
import api from '../api/api'

// Añade una interfaz para el tipo de tratamiento
interface Treatment {
  id: number;
  name: string;
  duration: string;
  frequency: string;
}

interface TreatmentPlanProps {
  patientId: number;
}

const TreatmentPlan: React.FC<TreatmentPlanProps> = ({ patientId }) => {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [newTreatment, setNewTreatment] = useState({ name: '', duration: '', frequency: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTreatments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/planes-tratamiento/pacientes/${patientId}`);
        console.log('API response:', response.data);
        setTreatments(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error al obtener los tratamientos:', error);
        setError('Error al cargar los tratamientos');
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) {
      fetchTreatments();
    }
  }, [patientId]);

  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTreatment.name && newTreatment.duration && newTreatment.frequency) {
      try {
        const response = await api.post('/planes-tratamiento', {
          ...newTreatment,
          patientId: patientId
        });
        setTreatments([...treatments, response.data]);
        setNewTreatment({ name: '', duration: '', frequency: '' });
      } catch (error) {
        console.error('Error al agregar el tratamiento:', error);
        setError('Error al agregar el tratamiento');
      }
    }
  };

  if (!Array.isArray(treatments)) {
    console.error('treatments is not an array:', treatments);
    return <div>Error: Los tratamientos no son válidos</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Plan de Tratamiento</h2>
      {isLoading && <p>Cargando planes de tratamiento...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && treatments.length === 0 && <p>No hay planes de tratamiento para este paciente.</p>}
      <div className="space-y-4 mb-6">
        {Array.isArray(treatments) && treatments.map((treatment) => (
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
