import React, { useState, useEffect } from 'react'
import { Activity, Plus, Check, X, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface Exercise {
  id: string;
  name: string;
  duration: string;
  frequency: string;
  completed: boolean;
  lastCompleted?: Date;
}

const ExercisePlan = () => {
  const { user } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: 'Estiramiento de isquiotibiales', duration: '10 minutos', frequency: 'Diario', completed: false },
    { id: '2', name: 'Fortalecimiento de cuádriceps', duration: '15 minutos', frequency: '3 veces por semana', completed: false },
  ])
  const [newExercise, setNewExercise] = useState({ name: '', duration: '', frequency: '' })
  const [showReminder, setShowReminder] = useState(false)

  useEffect(() => {
    const checkExerciseReminders = () => {
      const now = new Date()
      const exercisesToRemind = exercises.filter(ex => {
        if (ex.lastCompleted) {
          const timeSinceLastCompleted = now.getTime() - ex.lastCompleted.getTime()
          const daysSinceLastCompleted = timeSinceLastCompleted / (1000 * 3600 * 24)
          return daysSinceLastCompleted >= 1 && !ex.completed
        }
        return !ex.completed
      })

      if (exercisesToRemind.length > 0) {
        setShowReminder(true)
      }
    }

    const intervalId = setInterval(checkExerciseReminders, 60000) // Check every minute
    return () => clearInterval(intervalId)
  }, [exercises])

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault()
    if (newExercise.name && newExercise.duration && newExercise.frequency) {
      setExercises([...exercises, { id: Date.now().toString(), ...newExercise, completed: false }])
      setNewExercise({ name: '', duration: '', frequency: '' })
    }
  }

  const toggleExerciseCompletion = (id: string) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed, lastCompleted: new Date() } : ex
    ))
  }

  const dismissReminder = () => {
    setShowReminder(false)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      <h2 className="text-2xl font-semibold mb-4">Plan de Ejercicios</h2>
      {showReminder && (
        <div className="absolute top-4 right-4 bg-yellow-100 p-2 rounded-md flex items-center">
          <Bell className="w-5 h-5 text-yellow-500 mr-2" />
          <span>¡Recuerda completar tus ejercicios!</span>
          <button onClick={dismissReminder} className="ml-2 text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="space-y-4">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="border-b pb-4 flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-5 h-5 text-green-500" />
                <span className="font-medium">{exercise.name}</span>
              </div>
              <p><strong>Duración:</strong> {exercise.duration}</p>
              <p><strong>Frecuencia:</strong> {exercise.frequency}</p>
              {exercise.lastCompleted && (
                <p className="text-sm text-gray-500">
                  Último completado: {exercise.lastCompleted.toLocaleDateString()}
                </p>
              )}
            </div>
            {user?.role === 'patient' && (
              <button
                onClick={() => toggleExerciseCompletion(exercise.id)}
                className={`p-2 rounded-full ${exercise.completed ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                {exercise.completed ? <Check className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-gray-500" />}
              </button>
            )}
          </div>
        ))}
      </div>
      {user?.role === 'physiotherapist' && (
        <form onSubmit={handleAddExercise} className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold mb-2">Agregar Nuevo Ejercicio</h3>
          <input
            type="text"
            placeholder="Nombre del ejercicio"
            value={newExercise.name}
            onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
            className="w-full border rounded-md p-2"
            required
          />
          <input
            type="text"
            placeholder="Duración"
            value={newExercise.duration}
            onChange={(e) => setNewExercise({ ...newExercise, duration: e.target.value })}
            className="w-full border rounded-md p-2"
            required
          />
          <input
            type="text"
            placeholder="Frecuencia"
            value={newExercise.frequency}
            onChange={(e) => setNewExercise({ ...newExercise, frequency: e.target.value })}
            className="w-full border rounded-md p-2"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 flex items-center">
            <Plus className="w-5 h-5 mr-2" /> Agregar Ejercicio
          </button>
        </form>
      )}
    </div>
  )
}

export default ExercisePlan