import axios from 'axios';
import api from '../api/api';

export const getNotifications = async (page: number = 1) => {
    const response = await api.get(`/notifications?page=${page}`);
    return response.data;
};

export const markNotificationAsRead = async (id: number) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No se encontró el token de autenticación');
            throw new Error('No se encontró el token de autenticación');
        }
        console.log('Token antes de la llamada:', token); // Añade este log
        await api.put('/notifications/mark-all-read', {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Error al marcar todas las notificaciones como leídas:', error);
        if (axios.isAxiosError(error)) {
            console.error('Detalles del error:', error.response?.data);
        }
        throw error;
    }
};

export const deleteAllNotifications = async (): Promise<void> => {
    try {
        const token = localStorage.getItem('authToken'); // O como sea que almacenes el token
        const response = await api.delete('/notifications/delete-all', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (response.status !== 200) {
            throw new Error(`Error ${response.status}: ${response.data.message}`);
        }
        console.log('Notificaciones eliminadas con éxito:', response.data);
    } catch (error) {
        console.error('Error al eliminar todas las notificaciones:', error);
        throw error;
    }
};
