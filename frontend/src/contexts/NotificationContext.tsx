import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteAllNotifications } from '../services/notificationService';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

interface Notification {
    id: number;
    message: string;
    type: 'info' | 'warning' | 'success';
    read: boolean;
    createdAt: Date;
}

interface NotificationState {
    notifications: Notification[];
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
}

interface NotificationContextType {
    notifications: Notification[];
    notificationState: NotificationState;
    markAsRead: (id: number) => Promise<void>;
    fetchNotifications: (page?: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteAll: () => Promise<void>;
    addNotification: (notification: Notification) => void;
    lastNotificationTimestamp: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [notificationState, setNotificationState] = useState<NotificationState>({
        notifications: [],
        hasMore: false,
        currentPage: 1,
        totalPages: 1
    });
    const [lastNotificationTimestamp, setLastNotificationTimestamp] = useState(Date.now());
    const { user } = useAuth();

    const fetchNotifications = useCallback(async (page: number = 1) => {
        if (user) {
            try {
                const response = await getNotifications(page);
                setNotificationState(prevState => ({
                    ...prevState,
                    notifications: page === 1 ? response.notifications : [...prevState.notifications, ...response.notifications],
                    hasMore: response.hasMore,
                    currentPage: response.currentPage,
                    totalPages: response.totalPages
                }));
            } catch (error) {
                console.error('Error al obtener notificaciones:', error);
            }
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            
            // Configurar socket para notificaciones en tiempo real
            const socket = io('http://localhost:3000', {
                query: { userId: user.id }
            });

            socket.on('newNotification', (notification: Notification) => {
                addNotification(notification);
            });

            // Actualizar notificaciones cada 30 segundos
            const intervalId = setInterval(() => {
                fetchNotifications();
            }, 30000);

            return () => {
                clearInterval(intervalId);
                socket.disconnect();
            };
        }
    }, [user, fetchNotifications]);

    const addNotification = useCallback((notification: Notification) => {
        setNotificationState(prevState => ({
            ...prevState,
            notifications: [notification, ...prevState.notifications]
        }));
        setLastNotificationTimestamp(Date.now());
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await markNotificationAsRead(id);
            setNotificationState(prev => ({
                ...prev,
                notifications: prev.notifications.map(notification =>
                    notification.id === id ? { ...notification, read: true } : notification
                )
            }));
        } catch (error) {
            console.error('Error al marcar la notificación como leída:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotificationState(prev => ({
                ...prev,
                notifications: prev.notifications.map(notification => ({ ...notification, read: true }))
            }));
        } catch (error) {
            console.error('Error al marcar todas las notificaciones como leídas:', error);
        }
    };

    const deleteAll = async () => {
        try {
            await deleteAllNotifications();
            setNotificationState(prev => ({ ...prev, notifications: [] }));
        } catch (error) {
            console.error('Error al eliminar todas las notificaciones:', error);
        }
    };


    return (
        <NotificationContext.Provider value={{
            notifications: notificationState.notifications,
            notificationState,
            addNotification,
            markAsRead,
            markAllAsRead,
            deleteAll,
            lastNotificationTimestamp,
            fetchNotifications,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
