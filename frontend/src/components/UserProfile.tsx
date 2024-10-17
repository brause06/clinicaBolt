import React, { useState, useEffect, useRef } from 'react'
import { User, Mail, Phone, Edit2, Save, Calendar, MapPin, Camera } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types/user'
import { getUserProfile, updateUserProfile } from '../services/userService'
import api from '../api/api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const UserProfile: React.FC = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    id: 0,
    username: '',
    email: '',
    phoneNumber: '',
    role: UserRole.PACIENTE,
    specialization: '',
    dateOfBirth: '',
    address: '',
    profileImageUrl: '',
  })
  const [editedProfile, setEditedProfile] = useState(profile)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile()
  }, [user])

  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  const fetchProfile = async () => {
    if (user && 'id' in user) {
      try {
        const userProfile = await getUserProfile(user.id)
        console.log("URL de la imagen de perfil:", userProfile.profileImageUrl)
        const formattedProfile = {
          ...userProfile,
          dateOfBirth: userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth).toISOString().split('T')[0] : '',
        }
        setProfile(formattedProfile)
        setEditedProfile(formattedProfile)
        setProfileImageUrl(userProfile.profileImageUrl ? `${BASE_URL}${userProfile.profileImageUrl}` : null)
      } catch (error) {
        console.error('Error al obtener el perfil:', error)
        setError('Error al cargar el perfil')
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setPreviewImageUrl(URL.createObjectURL(file));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append('username', editedProfile.username);
    formData.append('email', editedProfile.email);
    formData.append('phoneNumber', editedProfile.phoneNumber);
    formData.append('address', editedProfile.address);
    formData.append('dateOfBirth', editedProfile.dateOfBirth);
    formData.append('specialization', editedProfile.specialization);

    if (profilePicture) {
      formData.append('profileImage', profilePicture);
    }

    try {
      const response = await api.put(`/users/profile/${editedProfile.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(response.data);
      setEditedProfile(response.data);
      setIsEditing(false);
      setMessage('Perfil actualizado con éxito');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil');
    }
  };

  const handleEdit = () => {
    setIsEditing(true)
    setEditedProfile(profile)
    setMessage(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProfile(profile)
    setError(null)
    setMessage(null)
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {message && <div className="text-green-500 mb-4">{message}</div>}
      <div className="mb-4">
        {(previewImageUrl || profileImageUrl) && !imageLoadError ? (
          <img 
            src={previewImageUrl ?? profileImageUrl ?? undefined}
            alt="Foto de perfil" 
            className="w-32 h-32 rounded-full mx-auto object-cover"
            onError={() => setImageLoadError(true)}
          />
        ) : (
          <div className="w-32 h-32 rounded-full mx-auto bg-gray-200 flex items-center justify-center">
            <User className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {isEditing && (
          <div className="mt-2 text-center">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <Camera className="inline-block mr-2" />
              Cambiar foto
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              name="username"
              value={isEditing ? editedProfile.username : profile.username}
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
              value={isEditing ? editedProfile.email : profile.email}
              onChange={handleChange}
              disabled={!isEditing}
              className="flex-grow p-2 border rounded"
            />
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="tel"
              name="phoneNumber"
              value={isEditing ? editedProfile.phoneNumber : profile.phoneNumber}
              onChange={handleChange}
              disabled={!isEditing}
              className="flex-grow p-2 border rounded"
            />
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="date"
              name="dateOfBirth"
              value={isEditing ? editedProfile.dateOfBirth : profile.dateOfBirth}
              onChange={handleChange}
              disabled={!isEditing}
              className="flex-grow p-2 border rounded"
            />
          </div>
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              name="address"
              value={isEditing ? editedProfile.address : profile.address}
              onChange={handleChange}
              disabled={!isEditing}
              className="flex-grow p-2 border rounded"
            />
          </div>
        </div>
        {isEditing ? (
          <div>
            <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
              <Save className="inline-block mr-2" />
              Guardar Cambios
            </button>
            <button type="button" onClick={handleCancel} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Cancelar
            </button>
          </div>
        ) : (
          <button type="button" onClick={handleEdit} className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            <Edit2 className="inline-block mr-2" />
            Editar Perfil
          </button>
        )}
      </form>
    </div>
  )
}

export default UserProfile
