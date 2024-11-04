import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, TrendingUp, Loader, MessageSquare, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user';
import { Notification } from '../types/notification';
import { getUserSummary, UserSummary } from '../services/userService';
import api from '../api/api';

interface ActivitySummaryProps {
  notifications?: Notification[];
}

interface MensajeNoLeido {
    id: number;
    contenido: string;
    fechaEnvio: Date;
    emisor: {
        id: number;
        name: string;
    };
}

const ActivitySummary: React.FC<ActivitySummaryProps> = ({ notifications = [] }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState<MensajeNoLeido[]>([]);
  const [totalNoLeidos, setTotalNoLeidos] = useState(0);

  useEffect(() => {
    if (user && 'id' in user && user.role === UserRole.FISIOTERAPEUTA) {
      fetchSummary(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
        fetchMensajesNoLeidos();
    }
  }, [user]);

  const fetchSummary = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      if (!userId) {
        throw new Error('ID de usuario no válido');
      }
      const data = await getUserSummary(userId);
      
      if (!data || typeof data !== 'object') {
        throw new Error('Respuesta del servidor inválida');
      }
      
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setError(error instanceof Error ? error.message : 'No se pudo cargar el resumen de actividad');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMensajesNoLeidos = async () => {
    try {
        const response = await api.get(`/mensajes/no-leidos/${user?.id}`);
        setMensajesNoLeidos(response.data.mensajes);
        setTotalNoLeidos(response.data.totalNoLeidos);
    } catch (error) {
        console.error('Error al obtener mensajes no leídos:', error);
    }
  };

  const marcarComoLeido = async (mensajeId: number) => {
    try {
        await api.put(`/mensajes/${mensajeId}`, { leido: true });
        setMensajesNoLeidos(prev => prev.filter(m => m.id !== mensajeId));
        setTotalNoLeidos(prev => prev - 1);
    } catch (error) {
        console.error('Error al marcar mensaje como leído:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Resumen de Actividad</h2>
      
      {user?.role === UserRole.FISIOTERAPEUTA && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {loading ? (
            <div className="col-span-4 flex justify-center py-8">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="col-span-4 text-red-500 text-center py-4">
              {error}
            </div>
          ) : (
            <>
              <SummaryCard
                icon={<Users className="w-8 h-8 text-blue-500" />}
                title="Pacientes Activos"
                value={summary?.pacientesActivos || 0}
              />
              <SummaryCard
                icon={<Calendar className="w-8 h-8 text-green-500" />}
                title="Citas Próxima Semana"
                value={summary?.citasProximaSemana || 0}
              />
              <SummaryCard
                icon={<Clock className="w-8 h-8 text-yellow-500" />}
                title="Horas Semanales"
                value={summary?.horasSemanales || 0}
              />
              <SummaryCard
                icon={<TrendingUp className="w-8 h-8 text-purple-500" />}
                title="Mensajes del Mes"
                value={summary?.interaccionesMensajes || 0}
              />
            </>
          )}
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Notificaciones Recientes</h3>
        {notifications.length > 0 ? (
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li key={notification.id} className={`p-2 rounded ${
                notification.type === 'info' ? 'bg-blue-100' :
                notification.type === 'warning' ? 'bg-yellow-100' :
                notification.type === 'success' ? 'bg-green-100' :
                notification.type === 'appointment' ? 'bg-purple-100' :
                'bg-pink-100'
              }`}>
                {notification.message}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay notificaciones recientes.</p>
        )}
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
            Mensajes sin leer
          </h3>
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
            {totalNoLeidos}
          </span>
        </div>
        
        <div className="space-y-3">
          {mensajesNoLeidos.length > 0 ? (
            mensajesNoLeidos.map(mensaje => (
              <div 
                key={mensaje.id} 
                className="bg-blue-50 p-4 rounded-lg shadow-sm hover:bg-blue-100 transition-colors relative group"
              >
                <button
                  onClick={() => marcarComoLeido(mensaje.id)}
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Marcar como leído"
                >
                  <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                </button>
                <div>
                  <p className="font-semibold text-gray-800">
                    {mensaje.emisor.name}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {mensaje.contenido.length > 100 
                      ? `${mensaje.contenido.substring(0, 100)}...` 
                      : mensaje.contenido}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(mensaje.fechaEnvio).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No tienes mensajes sin leer
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, title, value }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
};

export default ActivitySummary;
