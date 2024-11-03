import React, { useState, useEffect, useRef } from 'react'
import { User, Mail, Phone, Edit2, Save, Calendar, MapPin, Camera, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types/user'
import { getUserProfile } from '../services/userService'
import api from '../api/api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ValidationErrors {
  username?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [message, setMessage] = useState<string | null>(null)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [imageLoadError, setImageLoadError] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [user])

  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl)
      }
    }
  }, [previewImageUrl])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s-]{9,}$/
    return phoneRegex.test(phone)
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    let isValid = true

    if (!editedProfile.username.trim()) {
      errors.username = 'El nombre de usuario es requerido'
      isValid = false
    }

    if (!validateEmail(editedProfile.email)) {
      errors.email = 'Por favor, ingrese un email válido'
      isValid = false
    }

    if (editedProfile.phoneNumber && !validatePhoneNumber(editedProfile.phoneNumber)) {
      errors.phoneNumber = 'Por favor, ingrese un número de teléfono válido'
      isValid = false
    }

    if (editedProfile.dateOfBirth) {
      const birthDate = new Date(editedProfile.dateOfBirth)
      const today = new Date()
      if (birthDate > today) {
        errors.dateOfBirth = 'La fecha de nacimiento no puede ser futura'
        isValid = false
      }
    }

    setValidationErrors(errors)
    return isValid
  }

  const fetchProfile = async () => {
    if (user && 'id' in user) {
      setIsLoading(true)
      setError(null)
      try {
        const userProfile = await getUserProfile(user.id)
        const formattedProfile = {
          ...userProfile,
          dateOfBirth: userProfile.dateOfBirth && 
                      new Date(userProfile.dateOfBirth).toString() !== 'Invalid Date' 
                        ? new Date(userProfile.dateOfBirth).toISOString().split('T')[0] 
                        : ''
        }
        setProfile(formattedProfile)
        setEditedProfile(formattedProfile)
        setProfileImageUrl(userProfile.profileImageUrl ? `${BASE_URL}${userProfile.profileImageUrl}` : null)
      } catch (error) {
        console.error('Error al obtener el perfil:', error)
        setError('No se pudo cargar el perfil. Por favor, intente nuevamente.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedProfile(prev => ({ ...prev, [name]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('La imagen no debe superar los 5MB')
        return
      }
      setProfilePicture(file)
      setPreviewImageUrl(URL.createObjectURL(file))
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!validateForm()) {
      setError('Por favor, corrija los errores antes de guardar')
      return
    }

    const formData = new FormData()
    formData.append('username', editedProfile.username)
    formData.append('email', editedProfile.email)
    formData.append('phoneNumber', editedProfile.phoneNumber)
    formData.append('address', editedProfile.address)
    if (editedProfile.dateOfBirth) {
      formData.append('dateOfBirth', editedProfile.dateOfBirth)
    }
    formData.append('specialization', editedProfile.specialization)

    if (profilePicture) {
      formData.append('profileImage', profilePicture)
    }

    setIsSaving(true)
    try {
      const response = await api.put(`/users/profile/${editedProfile.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setProfile(response.data)
      setEditedProfile(response.data)
      setIsEditing(false)
      setMessage('Perfil actualizado con éxito')
      setProfilePicture(null)
    } catch (err: unknown) {
      console.error('Error updating profile:', err)
      const apiError = err as ApiError
      setError(apiError.response?.data?.message || 'Error al actualizar el perfil. Por favor, intente nuevamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedProfile(profile)
    setMessage(null)
    setError(null)
    setValidationErrors({})
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProfile(profile)
    setError(null)
    setMessage(null)
    setValidationErrors({})
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl)
      setPreviewImageUrl(null)
    }
    setProfilePicture(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6" role="main" aria-label="Perfil de usuario">
      {error && (
        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="text-green-500 mb-4 p-3 bg-green-50 rounded" role="status">
          {message}
        </div>
      )}

      {/* Cabecera con foto de perfil y botón de edición */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <div className="flex-1 flex flex-col items-center">
          {(previewImageUrl || profileImageUrl) && !imageLoadError ? (
            <img 
              src={previewImageUrl ?? profileImageUrl ?? undefined}
              alt="Foto de perfil" 
              className="w-32 h-32 rounded-full object-cover"
              onError={() => setImageLoadError(true)}
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-16 h-16 text-gray-400" aria-hidden="true" />
            </div>
          )}
          {isEditing && (
            <div className="mt-2">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Cambiar foto de perfil"
              >
                <Camera className="inline-block mr-2" aria-hidden="true" />
                Cambiar foto
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                aria-label="Subir foto de perfil"
              />
            </div>
          )}
        </div>
        
        {!isEditing && (
          <div className="mt-4 sm:mt-0">
            <button 
              type="button"
              onClick={handleEdit} 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Edit2 className="h-4 w-4 mr-2" aria-hidden="true" />
              Editar Perfil
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div className="flex flex-col">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-2" aria-hidden="true" />
                <input
                  type="text"
                  name="username"
                  value={isEditing ? editedProfile.username : profile.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-label="Nombre de usuario"
                  aria-invalid={!!validationErrors.username}
                  aria-describedby={validationErrors.username ? "username-error" : undefined}
                />
              </div>
              {validationErrors.username && (
                <span id="username-error" className="text-red-500 text-sm mt-1">
                  {validationErrors.username}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-2" aria-hidden="true" />
                <input
                  type="email"
                  name="email"
                  value={isEditing ? editedProfile.email : profile.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-label="Correo electrónico"
                  aria-invalid={!!validationErrors.email}
                  aria-describedby={validationErrors.email ? "email-error" : undefined}
                />
              </div>
              {validationErrors.email && (
                <span id="email-error" className="text-red-500 text-sm mt-1">
                  {validationErrors.email}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-2" aria-hidden="true" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={isEditing ? editedProfile.phoneNumber : profile.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-label="Número de teléfono"
                  aria-invalid={!!validationErrors.phoneNumber}
                  aria-describedby={validationErrors.phoneNumber ? "phone-error" : undefined}
                />
              </div>
              {validationErrors.phoneNumber && (
                <span id="phone-error" className="text-red-500 text-sm mt-1">
                  {validationErrors.phoneNumber}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" aria-hidden="true" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={isEditing ? editedProfile.dateOfBirth || '' : profile.dateOfBirth || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-label="Fecha de nacimiento"
                  aria-invalid={!!validationErrors.dateOfBirth}
                  aria-describedby={validationErrors.dateOfBirth ? "date-error" : undefined}
                />
              </div>
              {validationErrors.dateOfBirth && (
                <span id="date-error" className="text-red-500 text-sm mt-1">
                  {validationErrors.dateOfBirth}
                </span>
              )}
            </div>

            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" aria-hidden="true" />
              <input
                type="text"
                name="address"
                value={isEditing ? editedProfile.address : profile.address}
                onChange={handleChange}
                disabled={!isEditing}
                className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Dirección"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="inline-block mr-2" aria-hidden="true" />
                  Guardar Cambios
                </>
              )}
            </button>
            <button 
              type="button"
              onClick={handleCancel} 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              disabled={isSaving}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-2" aria-hidden="true" />
              <input
                type="text"
                name="username"
                value={profile.username}
                disabled={true}
                className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Nombre de usuario"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-2" aria-hidden="true" />
              <input
                type="email"
                name="email"
                value={profile.email}
                disabled={true}
                className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Correo electrónico"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-2" aria-hidden="true" />
              <input
                type="tel"
                name="phoneNumber"
                value={profile.phoneNumber}
                disabled={true}
                className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Número de teléfono"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-2" aria-hidden="true" />
              <input
                type="date"
                name="dateOfBirth"
                value={profile.dateOfBirth}
                disabled={true}
                className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Fecha de nacimiento"
              />
            </div>
          </div>

          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-gray-400 mr-2" aria-hidden="true" />
            <input
              type="text"
              name="address"
              value={profile.address}
              disabled={true}
              className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Dirección"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile
