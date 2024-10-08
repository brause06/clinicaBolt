import React, { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: Date;
  read: boolean;
}

const Notifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    // Simular la carga de notificaciones
    const mockNotifications: Notification[] = [
      { id: '1', message: 'Recordatorio: Tienes una cita mañana a las 10:00', type: 'info', timestamp: new Date(), read: false },
      { id: '2', message: 'Nuevo mensaje de tu fisioterapeuta', type: 'info', timestamp: new Date(), read: false },
      { id: '3', message: 'No olvides completar tus ejercicios hoy', type: 'warning', timestamp: new Date(), read: false },
      { id: '4', message: '¡Felicidades! Has alcanzado tu objetivo semanal', type: 'success', timestamp: new Date(), read: false },
    ]
    setNotifications(mockNotifications)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2">
            <div className="px-4 py-2 bg-gray-100 font-semibold">Notificaciones</div>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`px-4 py-2 hover:bg-gray-100 ${notification.read ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <p className={`text-sm ${
                      notification.type === 'info' ? 'text-blue-600' :
                      notification.type === 'warning' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {notification.message}
                    </p>
                    <button 
                      onClick={() => removeNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.timestamp.toLocaleString()}
                  </p>
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-blue-500 hover:underline mt-1"
                    >
                      Marcar como leído
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No hay notificaciones</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Notifications