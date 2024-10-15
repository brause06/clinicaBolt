import React, { useState } from 'react'
import { Calendar, FileText, Activity, MessageSquare, User, Users, BarChart, TrendingUp, Target, ClipboardList, Menu, ChevronLeft } from 'lucide-react'
import AppointmentScheduler from '../components/AppointmentScheduler'
import MedicalHistory from '../components/MedicalHistory'
import ExercisePlan from '../components/ExercisePlan'
import Chat from '../components/Chat'
import PatientList from '../components/PatientList'
import TreatmentPlan from '../components/TreatmentPlan'
import PatientProgress from '../components/PatientProgress'
import TreatmentGoals from '../components/TreatmentGoals'
import DashboardNavItem from '../components/DashboardNavItem'
import UserProfile from '../components/UserProfile'
import ActivitySummary from '../components/ActivitySummary'

interface Patient {
  id: number;
  name: string;
  age: number;
  condition?: string;
  lastAppointment?: string;
}

const Dashboard: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<string>('summary')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // Mock notifications
  const mockNotifications = [
    { id: '1', message: 'Nueva cita programada para mañana', type: 'info' as const, timestamp: new Date() },
    { id: '2', message: 'Recordatorio: Completar informe semanal', type: 'warning' as const, timestamp: new Date() },
    { id: '3', message: 'Objetivo de tratamiento alcanzado', type: 'success' as const, timestamp: new Date() },
  ]

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
  }

  const renderComponent = () => {
    switch (activeComponent) {
      case 'summary':
        return <ActivitySummary notifications={mockNotifications} />
      case 'appointments':
        return <AppointmentScheduler />
      case 'medical-history':
        return selectedPatient ? <MedicalHistory patientId={selectedPatient.id} /> : <p>Seleccione un paciente para ver su historial médico.</p>
      case 'exercise-plan':
        return selectedPatient ? <ExercisePlan patientId={selectedPatient.id} /> : <p>Seleccione un paciente para ver su plan de ejercicios.</p>
      case 'chat':
        return <Chat />
      case 'patients':
        return <PatientList onSelectPatient={handleSelectPatient} selectedPatientId={selectedPatient?.id || null} />
      case 'treatment-plan':
        return selectedPatient ? <TreatmentPlan patientId={selectedPatient.id} /> : <p>Seleccione un paciente para ver su plan de tratamiento.</p>
      case 'progress':
        return selectedPatient ? <PatientProgress patientId={selectedPatient.id} /> : <p>Seleccione un paciente para ver su progreso.</p>
      case 'goals':
        return selectedPatient ? <TreatmentGoals patientId={selectedPatient.id} /> : <p>Seleccione un paciente para ver sus objetivos de tratamiento.</p>
      case 'profile':
        return <UserProfile />
      default:
        return <ActivitySummary notifications={mockNotifications} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <nav className={`bg-white shadow-lg ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}>
        <div className="p-4 flex justify-between items-center">
          <h2 className={`font-semibold text-xl ${isSidebarOpen ? 'block' : 'hidden'}`}>Dashboard</h2>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-200">
            {isSidebarOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className="mt-4">
          <DashboardNavItem
            icon={<BarChart size={24} />}
            title="Resumen"
            active={activeComponent === 'summary'}
            onClick={() => setActiveComponent('summary')}
            showTitle={isSidebarOpen}
          />
          <DashboardNavItem
            icon={<Users size={24} />}
            title="Pacientes"
            active={activeComponent === 'patients'}
            onClick={() => setActiveComponent('patients')}
            showTitle={isSidebarOpen}
          />
          <DashboardNavItem
            icon={<Calendar size={24} />}
            title="Citas"
            active={activeComponent === 'appointments'}
            onClick={() => setActiveComponent('appointments')}
            showTitle={isSidebarOpen}
          />
          <DashboardNavItem
            icon={<FileText size={24} />}
            title="Historial Médico"
            active={activeComponent === 'medical-history'}
            onClick={() => setActiveComponent('medical-history')}
            showTitle={isSidebarOpen}
          />
          <DashboardNavItem
            icon={<Activity size={24} />}
            title="Plan de Ejercicios"
            active={activeComponent === 'exercise-plan'}
            onClick={() => setActiveComponent('exercise-plan')}
            showTitle={isSidebarOpen}
          />
          <DashboardNavItem
            icon={<MessageSquare size={24} />}
            title="Chat"
            active={activeComponent === 'chat'}
            onClick={() => setActiveComponent('chat')}
            showTitle={isSidebarOpen}
          />
          <DashboardNavItem
            icon={<ClipboardList size={24} />}
            title="Plan de Tratamiento"
            active={activeComponent === 'treatment-plan'}
            onClick={() => setActiveComponent('treatment-plan')}
            showTitle={isSidebarOpen}
          />
          <DashboardNavItem
            icon={<TrendingUp size={24} />}
            title="Progreso del Paciente"
            active={activeComponent === 'progress'}
            onClick={() => setActiveComponent('progress')}
            showTitle={isSidebarOpen}
          />
          <DashboardNavItem
            icon={<Target size={24} />}
            title="Objetivos de Tratamiento"
            active={activeComponent === 'goals'}
            onClick={() => setActiveComponent('goals')}
            showTitle={isSidebarOpen}
          />
          <DashboardNavItem
            icon={<User size={24} />}
            title="Perfil"
            active={activeComponent === 'profile'}
            onClick={() => setActiveComponent('profile')}
            showTitle={isSidebarOpen}
          />
        </div>
      </nav>
      <main className="flex-grow p-6 overflow-y-auto">
        {renderComponent()}
      </main>
    </div>
  )
}

export default Dashboard
