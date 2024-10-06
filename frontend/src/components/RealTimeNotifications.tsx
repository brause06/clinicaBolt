import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: Date;
}

const RealTimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Simulación de recepción de notificaciones en tiempo real
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        message: `Nueva notificación ${Date.now()}`,
        type: ['info', 'warning', 'success'][Math.floor(Math.random() * 3)] as 'info' | 'warning' | 'success',
        timestamp: new Date(),
      };
      setNotifications(prevNotifications => [...prevNotifications, newNotification]);
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Bell size={24} />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2">
            <div className="px-4 py-2 bg-gray-100 font-semibold">Notificaciones</div>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification.id} className="px-4 py-2 hover:bg-gray-100">
                  <p className={`text-sm ${
                    notification.type === 'info' ? 'text-blue-600' :
                    notification.type === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.timestamp.toLocaleString()}
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