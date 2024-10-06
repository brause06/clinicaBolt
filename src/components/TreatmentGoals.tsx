import React, { useState } from 'react'
import { Target, Plus, Check, X } from 'lucide-react'

interface Goal {
  id: string;
  description: string;
  targetDate: string;
  completed: boolean;
}

const TreatmentGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', description: 'Aumentar la flexibilidad de la espalda en un 20%', targetDate: '2023-06-30', completed: false },
    { id: '2', description: 'Reducir el dolor lumbar a un nivel 2/10', targetDate: '2023-07-15', completed: false },
  ])
  const [newGoal, setNewGoal] = useState({ description: '', targetDate: '' })

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (newGoal.description && newGoal.targetDate) {
      setGoals([...goals, { id: Date.now().toString(), ...newGoal, completed: false }])
      setNewGoal({ description: '', targetDate: '' })
    }
  }

  const toggleGoalCompletion = (id: string) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ))
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Objetivos del Tratamiento</h2>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="flex items-center justify-between border-b pb-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="font-medium">{goal.description}</span>
              </div>
              <p className="text-sm text-gray-600">Fecha objetivo: {goal.targetDate}</p>
            </div>
            <button
              onClick={() => toggleGoalCompletion(goal.id)}
              className={`p-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              {goal.completed ? <Check className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-gray-500" />}
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddGoal} className="mt-6 space-y-4">
        <input
          type="text"
          placeholder="Descripción del objetivo"
          value={newGoal.description}
          onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
          className="w-full border rounded-md p-2"
          required
        />
        <input
          type="date"
          value={newGoal.targetDate}
          onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
          className="w-full border rounded-md p-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Agregar Objetivo
        </button>
      </form>
    </div>
  )
}

export default TreatmentGoals