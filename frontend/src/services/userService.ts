import api from '../api/api'
import { User } from '../types/user'
import axios from 'axios'

export interface UserSummary {
    citasCompletadas: number;
    citasProximaSemana: number;
    horasSemanales: number;
    pacientesActivos: number;
    interaccionesMensajes: number;
}

export const getUserProfile = async (userId: number) => {
  console.log("Solicitando perfil para el usuario:", userId)
  try {
    const response = await api.get(`/users/profile/${userId}`)
    console.log("Respuesta del servidor (getUserProfile):", response.data)
    return response.data
  } catch (error) {
    console.error('Error al obtener el perfil:', error)
    throw error
  }
}

export const updateUserProfile = async (userData: Partial<User>, profilePicture?: File): Promise<User> => {
  try {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key as keyof User]?.toString() || '');
    });

    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    const response = await api.put(`/users/profile/${userData.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Respuesta del servidor:', response.data);

    if (response.data.profilePictureUrl) {
      console.log('Nueva URL de la imagen de perfil:', response.data.profilePictureUrl);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error al actualizar el perfil:', error.response.data);
      if (error.response.status === 500) {
        throw new Error('Error interno del servidor al procesar la imagen. Por favor, inténtalo de nuevo o contacta al soporte.');
      } else {
        throw new Error(error.response.data.message || 'Error al actualizar el perfil');
      }
    } else {
      console.error('Error desconocido al actualizar el perfil:', error);
      throw new Error('Error desconocido al actualizar el perfil');
    }
  }
};

export const getUserSummary = async (userId: number): Promise<UserSummary> => {
  try {
    const response = await api.get(`/users/summary/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el resumen del usuario:', error);
    throw error;
  }
};
