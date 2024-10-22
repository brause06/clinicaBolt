import React from 'react';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';

const TestNotificationButton: React.FC = () => {
  const { user } = useAuth();

  const handleTestNotification = async () => {
    try {
      if (user && 'id' in user) {
        const response = await api.post(`/notifications/test/${user.id}`);
        console.log('Notificación de prueba enviada:', response.data);
      }
    } catch (error) {
      console.error('Error al enviar notificación de prueba:', error);
    }
  };

  return (
    <button
      onClick={handleTestNotification}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Enviar notificación de prueba
    </button>
  );
};

export default TestNotificationButton;
