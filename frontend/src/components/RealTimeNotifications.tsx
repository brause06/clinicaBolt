import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Check } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const RealTimeNotifications: React.FC = () => {
  const { notificationState, addNotification, markAllAsRead, deleteAll } = useNotifications();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('Iniciando conexión de socket para notificaciones');
      const socket = io('http://localhost:3000', {
        query: { userId: user.id },
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        console.log('Socket conectado para notificaciones');
      });

      socket.on('newNotification', (notification) => {
        console.log('Nueva notificación recibida:', notification);
        addNotification(notification);
      });

      return () => {
        console.log('Desconectando socket de notificaciones');
        socket.disconnect();
      };
    }
  }, [user, addNotification]);

  console.log('Notificaciones actuales:', notificationState);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    console.log('Todas las notificaciones marcadas como leídas');
  };

  const handleDeleteAll = async () => {
    await deleteAll();
    console.log('Todas las notificaciones eliminadas');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Bell size={24} />
        {notificationState.notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {notificationState.notifications.length}
          </span>
        )}
      </button>
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2">
            <div className="px-4 py-2 bg-gray-100 font-semibold flex justify-between items-center">
              <span>Notificaciones</span>
              <div>
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-blue-600 hover:text-blue-800 mr-2"
                  title="Marcar todas como leídas"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar todas"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {notificationState.notifications.length > 0 ? (
              notificationState.notifications.map((notification) => (
                <div key={notification.id} className="px-4 py-2 hover:bg-gray-100">
                  <p className={`text-sm ${
                    notification.type === 'info' ? 'text-blue-600' :
                    notification.type === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No hay notificaciones</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeNotifications;
