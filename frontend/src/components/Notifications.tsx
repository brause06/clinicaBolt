import React, { useState, useMemo } from 'react'
import { Bell, X } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'
import { Notification } from '../types/notification'


const Notifications = () => {
  const { notifications, markAsRead, deleteAll, lastNotificationTimestamp } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)
  

  const unreadCount = useMemo(() => 
    notifications.filter((n) => !n.read).length, 
    [notifications, lastNotificationTimestamp]
  );

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
              notifications.map((notification: Notification) => (
                <div 
                  key={notification.id} 
                  className={`px-4 py-2 hover:bg-gray-100 ${notification.read ? 'opacity-50' : ''} ${
                    notification.type === 'appointment' ? 'bg-purple-100' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className={`text-sm ${
                      notification.type === 'info' ? 'text-blue-600' :
                      notification.type === 'warning' ? 'text-yellow-600' :
                      notification.type === 'appointment' ? 'text-purple-600' :
                      'text-green-600'
                    }`}>
                      {notification.message}
                    </p>
                    <button 
                      onClick={() => deleteAll()}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead(Number(notification.id))}
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
