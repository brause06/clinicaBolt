import React, { useState, useEffect } from 'react';
import { Ejercicio, getEjerciciosByPatient, createEjercicio, updateEjercicio, deleteEjercicio } from '../api/ejercicioService';

interface ExercisePlanProps {
  patientId: number;
}

const ExercisePlan: React.FC<ExercisePlanProps> = ({ patientId }) => {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [newEjercicio, setNewEjercicio] = useState<Omit<Ejercicio, 'id'>>({
    name: '',
    description: '',
    duration: 0,
    frequency: '',
    patientId: patientId
  });

  useEffect(() => {
    fetchEjercicios();
  }, [patientId]);

  const fetchEjercicios = async () => {
    try {
      const data = await getEjerciciosByPatient(patientId);
      setEjercicios(data);
    } catch (error) {
      console.error('Error fetching ejercicios:', error);
    }
  };

  const handleAddEjercicio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const addedEjercicio = await createEjercicio(newEjercicio);
      setEjercicios([...ejercicios, addedEjercicio]);
      setNewEjercicio({
        name: '',
        description: '',
        duration: 0,
        frequency: '',
        patientId: patientId
      });
    } catch (error) {
      console.error('Error adding ejercicio:', error);
    }
  };

  const handleUpdateEjercicio = async (id: number, updatedEjercicio: Partial<Ejercicio>) => {
    try {
      const updated = await updateEjercicio(id, updatedEjercicio);
      setEjercicios(ejercicios.map(ej => ej.id === id ? updated : ej));
    } catch (error) {
      console.error('Error updating ejercicio:', error);
    }
  };

  const handleDeleteEjercicio = async (id: number) => {
    try {
      await deleteEjercicio(id);
      setEjercicios(ejercicios.filter(ej => ej.id !== id));
    } catch (error) {
      console.error('Error deleting ejercicio:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Plan de Ejercicios</h2>
      <ul className="space-y-4">
        {ejercicios.map(ejercicio => (
          <li key={ejercicio.id} className="border-b pb-4">
            <h3 className="font-medium">{ejercicio.name}</h3>
            <p>{ejercicio.description}</p>
            <p>Duración: {ejercicio.duration} minutos</p>
            <p>Frecuencia: {ejercicio.frequency}</p>
            <div className="mt-2">
              <button 
                onClick={() => handleDeleteEjercicio(ejercicio.id)}
                className="bg-red-500 text-white px-2 py-1 rounded mr-2"
              >
                Eliminar
              </button>
              {/* Aquí puedes agregar un botón o lógica para editar el ejercicio */}
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddEjercicio} className="mt-6">
        <input
          type="text"
          value={newEjercicio.name}
          onChange={e => setNewEjercicio({...newEjercicio, name: e.target.value})}
          placeholder="Nombre del ejercicio"
          className="w-full p-2 border rounded mb-2"
          required
        />
        <textarea
          value={newEjercicio.description}
          onChange={e => setNewEjercicio({...newEjercicio, description: e.target.value})}
          placeholder="Descripción"
          className="w-full p-2 border rounded mb-2"
          required
        />
        <input
          type="number"
          value={newEjercicio.duration}
          onChange={e => setNewEjercicio({...newEjercicio, duration: parseInt(e.target.value)})}
          placeholder="Duración (minutos)"
          className="w-full p-2 border rounded mb-2"
          required
        />
        <input
          type="text"
          value={newEjercicio.frequency}
          onChange={e => setNewEjercicio({...newEjercicio, frequency: e.target.value})}
          placeholder="Frecuencia (ej. '3 veces por semana')"
          className="w-full p-2 border rounded mb-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Agregar Ejercicio
        </button>
      </form>
    </div>
  );
};

export default ExercisePlan;
