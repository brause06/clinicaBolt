import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteAllNotifications } from '../services/notificationService';
import { useAuth } from './AuthContext';
import { io, Socket } from 'socket.io-client';

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
    notificationState: NotificationState;
    markAsRead: (id: number) => Promise<void>;
    fetchNotifications: (page?: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteAll: () => Promise<void>;
    addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [notificationState, setNotificationState] = useState<NotificationState>({
        notifications: [],
        hasMore: false,
        currentPage: 1,
        totalPages: 1
    });
    const { user } = useAuth();

    const fetchNotifications = useCallback(async (page: number = 1) => {
        if (user) {
            try {
                const response = await getNotifications(page);
                setNotificationState(response);
            } catch (error) {
                console.error('Error al obtener notificaciones:', error);
            }
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user, fetchNotifications]);

    useEffect(() => {
        let socket: Socket | null = null;

        if (user) {
            const token = localStorage.getItem('token');
            socket = io('http://localhost:3000', {
                transports: ['websocket', 'polling'],
                auth: { token },
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000,
            });

            socket.on('connect', () => {
                console.log('Conectado al servidor de WebSocket');
                socket?.emit('join', user.id);
            });

            socket.on('newNotification', (notification: Notification) => {
                console.log('Nueva notificación recibida:', notification);
                addNotification(notification);
            });

            socket.on('connect_error', (error) => {
                console.error('Error de conexión al WebSocket:', error.message);
            });
        }

        return () => {
            if (socket) {
                console.log('Desconectando socket');
                socket.disconnect();
            }
        };
    }, [user]);

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

    const addNotification = (newNotification: Notification) => {
        setNotificationState(prev => ({
            ...prev,
            notifications: [newNotification, ...prev.notifications]
        }));
    };

    return (
        <NotificationContext.Provider value={{ 
            notificationState, 
            markAsRead, 
            fetchNotifications, 
            markAllAsRead,
            deleteAll,
            addNotification
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
