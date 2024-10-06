import React, { useState } from 'react'
import { User, Mail, Phone, Edit2, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const UserProfile: React.FC = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '123-456-7890', // Ejemplo, deberías obtener esto del backend
    specialization: user?.role === 'physiotherapist' ? 'Fisioterapeuta Deportivo' : '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para actualizar el perfil en el backend
    console.log('Perfil actualizado:', profile)
    setIsEditing(false)
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Perfil de Usuario</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center text-blue-500 hover:text-blue-600"
        >
          {isEditing ? <Save className="w-5 h-5 mr-1" /> : <Edit2 className="w-5 h-5 mr-1" />}
          {isEditing ? 'Guardar' : 'Editar'}
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!isEditing}
              className="flex-grow p-2 border rounded"
            />
          </div>
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!isEditing}
              className="flex-grow p-2 border rounded"
            />
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className="flex-grow p-2 border rounded"
            />
          </div>
          {user?.role === 'physiotherapist' && (
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                name="specialization"
                value={profile.specialization}
                onChange={handleChange}
                disabled={!isEditing}
                className="flex-grow p-2 border rounded"
                placeholder="Especialización"
              />
            </div>
          )}
        </div>
        {isEditing && (
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Actualizar Perfil
          </button>
        )}
      </form>
    </div>
  )
}

export default UserProfile