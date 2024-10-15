import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: Date;
}

interface ActivitySummaryProps {
  notifications?: Notification[];
}

const ActivitySummary: React.FC<ActivitySummaryProps> = ({ notifications = [] }) => {
  const { user } = useAuth();

  // Mock data for the chart
  const data = [
    { name: 'Lun', exercises: 4, patients: 6 },
    { name: 'Mar', exercises: 3, patients: 8 },
    { name: 'Mié', exercises: 5, patients: 7 },
    { name: 'Jue', exercises: 2, patients: 9 },
    { name: 'Vie', exercises: 4, patients: 8 },
    { name: 'Sáb', exercises: 6, patients: 5 },
    { name: 'Dom', exercises: 3, patients: 3 },
  ];

  // Mock data for physiotherapist summary
  const physioSummary = {
    totalPatients: 45,
    appointmentsToday: 8,
    completedAppointments: 32,
    averageRating: 4.8,
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Resumen de Actividad</h2>
      
      {user?.role === UserRole.FISIOTERAPEUTA && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            icon={<Users className="w-8 h-8 text-blue-500" />}
            title="Total Pacientes"
            value={physioSummary.totalPatients}
          />
          <SummaryCard
            icon={<Calendar className="w-8 h-8 text-green-500" />}
            title="Citas Hoy"
            value={physioSummary.appointmentsToday}
          />
          <SummaryCard
            icon={<Clock className="w-8 h-8 text-yellow-500" />}
            title="Citas Completadas"
            value={physioSummary.completedAppointments}
          />
          <SummaryCard
            icon={<TrendingUp className="w-8 h-8 text-purple-500" />}
            title="Calificación Promedio"
            value={physioSummary.averageRating}
          />
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          {user?.role === UserRole.FISIOTERAPEUTA ? 'Pacientes Atendidos Esta Semana' : 'Ejercicios Completados Esta Semana'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={user?.role === UserRole.FISIOTERAPEUTA ? 'patients' : 'exercises'} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Notificaciones Recientes</h3>
        {notifications.length > 0 ? (
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li key={notification.id} className={`p-2 rounded ${
                notification.type === 'info' ? 'bg-blue-100' :
                notification.type === 'warning' ? 'bg-yellow-100' :
                'bg-green-100'
              }`}>
                {notification.message}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay notificaciones recientes.</p>
        )}
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