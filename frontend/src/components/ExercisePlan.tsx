import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user';
import axios from 'axios';
import { CheckCircle, Circle, Clock, Calendar } from 'react-feather';

interface Exercise {
  id: number;
  name: string;
  description: string;
  duration: number;
  frequency: string;
  videoUrl: string;
  imageUrl: string;
  completed: boolean;
  lastCompleted: Date;
}

interface ExercisePlanProps {
  patientId: number;
}

const ExercisePlan: React.FC<ExercisePlanProps> = ({ patientId }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExercise, setNewExercise] = useState({ nombre: '', descripcion: '', duracion: 0, frecuencia: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const isAdminOrPhysio = user?.role === UserRole.ADMIN || user?.role === UserRole.FISIOTERAPEUTA;

  useEffect(() => {
    fetchExercises();
  }, [patientId, user]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const id = user?.role === UserRole.PACIENTE ? user.id : patientId;
      console.log("Fetching exercises for patient ID:", id);
      
      const response = await api.get(`/pacientes/${id}/ejercicios`);
      console.log("Response:", response);
      setExercises(response.data);
      setLoading(false);
      if (response.data.length === 0) {
        if (isAdminOrPhysio) {
          setError('Este paciente no tiene ejercicios asignados. Puede asignarle ejercicios usando el formulario a continuación.');
        } else {
          setError('No tiene ejercicios asignados. Por favor, contacte a su fisioterapeuta.');
        }
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('Error al obtener los ejercicios:', error);
      setLoading(false);
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response);
        setError(error.response?.data?.message || 'Error al cargar los ejercicios. Por favor, intente de nuevo más tarde.');
      } else {
        setError('Error desconocido al cargar los ejercicios.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await api.post(`/pacientes/${patientId}/ejercicios`, newExercise);
      setExercises([...exercises, response.data]);
      setNewExercise({ nombre: '', descripcion: '', duracion: 0, frecuencia: '' });
      setError(null);
    } catch (error) {
      console.error('Error al agregar el ejercicio:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Error al agregar el ejercicio. Por favor, intente de nuevo.');
      } else {
        setError('Error desconocido al agregar el ejercicio.');
      }
    }
  };

  const handleCompleteExercise = async (id: number) => {
    try {
      await api.put(`/ejercicios/${id}/complete`);
      setExercises(exercises.map(ex => 
        ex.id === id ? { ...ex, completed: true, lastCompleted: new Date() } : ex
      ));
    } catch (error) {
      console.error('Error al marcar el ejercicio como completado:', error);
      setError('Error al actualizar el ejercicio. Por favor, intente de nuevo.');
    }
  };

  if (loading) {
    return <div>Cargando ejercicios...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Plan de Ejercicios</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {exercises.length > 0 ? (
        <ul className="space-y-6">
          {exercises.map((exercise) => (
            <li key={exercise.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">{exercise.name}</h3>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    exercise.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {exercise.completed ? 'Realizado' : 'Pendiente'}
                  </span>
                  {user?.role === UserRole.PACIENTE && (
                    <button 
                      onClick={() => handleCompleteExercise(exercise.id)}
                      className={`ml-2 p-2 rounded-full ${exercise.completed ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
                    >
                      {exercise.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-2">{exercise.description}</p>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  {exercise.duration} minutos
                </span>
                <span className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  {exercise.frequency}
                </span>
              </div>
              {exercise.lastCompleted && (
                <p className="text-sm text-green-600 mt-2">
                  Último completado: {new Date(exercise.lastCompleted).toLocaleDateString()}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No hay ejercicios asignados.</p>
      )}

      {isAdminOrPhysio && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold mb-2">Agregar nuevo ejercicio</h3>
          <input
            type="text"
            placeholder="Nombre del ejercicio"
            value={newExercise.nombre}
            onChange={(e) => setNewExercise({...newExercise, nombre: e.target.value})}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <textarea
            placeholder="Descripción"
            value={newExercise.descripcion}
            onChange={(e) => setNewExercise({...newExercise, descripcion: e.target.value})}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Duración (minutos)"
            value={newExercise.duracion}
            onChange={(e) => setNewExercise({...newExercise, duracion: parseInt(e.target.value)})}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Frecuencia"
            value={newExercise.frecuencia}
            onChange={(e) => setNewExercise({...newExercise, frecuencia: e.target.value})}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors duration-200">
            Agregar ejercicio
          </button>
        </form>
      )}
    </div>
  );
};

export default ExercisePlan;
