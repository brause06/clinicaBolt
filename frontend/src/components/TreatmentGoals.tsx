import React, { useState, useEffect } from 'react';
import api from '../api/api'; // Importa la instancia de api en lugar de axios
import { Objetivo } from '../types/objetivo';

interface TreatmentGoalsProps {
  patientId: number;
}

const TreatmentGoals: React.FC<TreatmentGoalsProps> = ({ patientId }) => {
  const [goals, setGoals] = useState<Objetivo[]>([]);
  const [newGoal, setNewGoal] = useState<Partial<Objetivo>>({ description: '', targetDate: '', progressPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [patientId]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/objetivos/patient/${patientId}`);
      setGoals(response.data);
    } catch (err) {
      setError('Error al cargar los objetivos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newGoal.description && newGoal.targetDate) {
      try {
        const response = await api.post('/objetivos', { ...newGoal, patientId });
        setGoals(prevGoals => [...prevGoals, response.data]);
        setNewGoal({ description: '', targetDate: '', progressPercentage: 0 });
      } catch (err) {
        setError('Error al añadir el objetivo');
        console.error(err);
      }
    }
  };

  const handleUpdateGoal = async (id: number, updates: Partial<Objetivo>) => {
    try {
      const response = await api.put(`/objetivos/${id}`, updates);
      setGoals(goals.map(goal => goal.id === id ? response.data : goal));
    } catch (err) {
      setError('Error al actualizar el objetivo');
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await api.delete(`/objetivos/${id}`);
      setGoals(goals.filter(goal => goal.id !== id));
    } catch (err) {
      setError('Error al eliminar el objetivo');
      console.error(err);
    }
  };

  if (loading) return <div>Cargando objetivos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Objetivos del Tratamiento</h2>
      
      <form onSubmit={handleAddGoal} className="mb-6">
        <input
          type="text"
          value={newGoal.description}
          onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
          placeholder="Descripción del objetivo"
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="date"
          value={newGoal.targetDate}
          onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          value={newGoal.progressPercentage}
          onChange={(e) => setNewGoal({...newGoal, progressPercentage: Number(e.target.value)})}
          placeholder="Progreso (%)"
          className="w-full p-2 mb-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Añadir Objetivo
        </button>
      </form>

      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="border p-4 rounded">
            <h3 className="font-semibold">{goal.description}</h3>
            <p>Fecha objetivo: {new Date(goal.targetDate).toLocaleDateString()}</p>
            <p>Progreso: {goal.progressPercentage || 0}%</p>
            <div className="mt-2">
              <input
                type="range"
                min="0"
                max="100"
                value={goal.progressPercentage || 0}
                onChange={(e) => handleUpdateGoal(goal.id, { progressPercentage: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            <div className="mt-2 flex justify-between">
              <button
                onClick={() => handleUpdateGoal(goal.id, { completed: !goal.completed })}
                className={`px-2 py-1 rounded ${goal.completed ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                {goal.completed ? 'Completado' : 'Marcar como completado'}
              </button>
              <button
                onClick={() => handleDeleteGoal(goal.id)}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreatmentGoals;
