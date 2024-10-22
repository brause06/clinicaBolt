import React, { useState, useEffect } from 'react'
import { Calendar, FileText, Activity, MessageSquare, User, Users, BarChart, TrendingUp, Target, ClipboardList, Menu, ChevronLeft } from 'lucide-react'
import AppointmentScheduler from '../components/AppointmentScheduler'
import MedicalHistory from '../components/MedicalHistory'
import ExercisePlan from '../components/ExercisePlan'
import Chat from '../components/Chat'
import TreatmentPlan from '../components/TreatmentPlan'
import PatientProgress from '../components/PatientProgress'
import TreatmentGoals from '../components/TreatmentGoals'
import DashboardNavItem from '../components/DashboardNavItem'
import UserProfile from '../components/UserProfile'
import ActivitySummary from '../components/ActivitySummary'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types/user'
import PatientManagement from '../components/PatientManagement'
import { Patient } from '../types/patient' // Ajusta la ruta según sea necesario
import TestNotificationButton from '../components/TestNotificationButton'


const Dashboard: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<string>('summary')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    console.log('Usuario actual:', user)
    console.log('Rol del usuario:', user?.role)
  }, [user])

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id)
  }

  const renderComponent = () => {
    switch (activeComponent) {
      case 'patients':
        return (
          <PatientManagement 
            onSelectPatient={handleSelectPatient} 
            selectedPatientId={selectedPatientId} 
          />
        );
      case 'summary':
        return <ActivitySummary />
      case 'appointments':
        return <AppointmentScheduler />
      case 'medical-history':
        return user?.role === UserRole.PACIENTE 
          ? <MedicalHistory patientId={user.id} /> 
          : selectedPatientId 
            ? <MedicalHistory patientId={selectedPatientId} />
            : <p>Seleccione un paciente para ver su historial médico.</p>
      case 'exercise-plan':
        return user?.role === UserRole.PACIENTE 
          ? <ExercisePlan patientId={user.id!} /> 
          : selectedPatientId
            ? <ExercisePlan patientId={selectedPatientId} />
            : <p>Seleccione un paciente para ver su plan de ejercicios.</p>
      case 'chat':
        return <Chat />
      case 'treatment-plan':
        return user?.role === UserRole.PACIENTE 
          ? <TreatmentPlan patientId={user.id} /> 
          : selectedPatientId
            ? <TreatmentPlan patientId={selectedPatientId} />
            : <p>Seleccione un paciente para ver su plan de tratamiento.</p>
      case 'progress':
        return user?.role === UserRole.PACIENTE 
          ? <PatientProgress patientId={user.id} /> 
          : selectedPatientId
            ? <PatientProgress patientId={selectedPatientId} />
            : <p>Seleccione un paciente para ver su progreso.</p>
      case 'goals':
        return user?.role === UserRole.PACIENTE 
          ? <TreatmentGoals patientId={user.id} /> 
          : selectedPatientId
            ? <TreatmentGoals patientId={selectedPatientId} />
            : <p>Seleccione un paciente para ver sus objetivos de tratamiento.</p>
      case 'profile':
        return <UserProfile />
      default:
        return <div>Selecciona una opción del menú</div>
    }
  }

  const navItems = [
    { icon: <BarChart size={24} />, title: "Resumen", id: 'summary' },
    { icon: <Calendar size={24} />, title: "Citas", id: 'appointments' },
    { icon: <FileText size={24} />, title: "Historial Médico", id: 'medical-history' },
    { icon: <Activity size={24} />, title: "Plan de Ejercicios", id: 'exercise-plan' },
    { icon: <MessageSquare size={24} />, title: "Chat", id: 'chat' },
  ]

  if (user?.role && user.role !== UserRole.PACIENTE) {
    console.log('Agregando elementos para no pacientes')
    navItems.splice(1, 0, { icon: <Users size={24} />, title: "Pacientes", id: 'patients' })
    navItems.push(
      { icon: <ClipboardList size={24} />, title: "Plan de Tratamiento", id: 'treatment-plan' },
      { icon: <TrendingUp size={24} />, title: "Progreso del Paciente", id: 'progress' },
      { icon: <Target size={24} />, title: "Objetivos de Tratamiento", id: 'goals' }
    )
  }

  // Añadir el icono de User al final del arreglo
  navItems.push({ icon: <User size={24} />, title: "Perfil", id: 'profile' })

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
          {/* Mostrar el rol del usuario */}
          <p className="px-4 py-2 text-sm text-gray-600">Rol: {user?.role || 'No definido'}</p>
          {navItems.map((item) => (
            <DashboardNavItem
              key={item.id}
              icon={item.icon}
              title={item.title}
              active={activeComponent === item.id}
              onClick={() => setActiveComponent(item.id)}
              showTitle={isSidebarOpen}
            />
          ))}
        </div>
      </nav>
      <main className="flex-grow p-6 overflow-y-auto">
        {renderComponent()}
      </main>
      <TestNotificationButton />
    </div>
  )
}

export default Dashboard
