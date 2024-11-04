import React, { useState, useEffect } from 'react'
import { Calendar, FileText, Activity, MessageSquare, User, Users, BarChart, TrendingUp, Target, ClipboardList, Menu, ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react'
import AppointmentScheduler from '../components/AppointmentScheduler'
import MedicalHistory from '../components/MedicalHistory'
import ExercisePlan from '../components/ExercisePlan'
import Chat from '../components/Chat'
import TreatmentPlan from '../components/TreatmentPlan'
import PatientProgress from '../components/PatientProgress'
import TreatmentGoals from '../components/TreatmentGoals'
import UserProfile from '../components/UserProfile'
import ActivitySummary from '../components/ActivitySummary'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types/user'
import PatientManagement from '../components/PatientManagement'
import { Patient } from '../types/patient' // Ajusta la ruta según sea necesario
//import TestNotificationButton from '../components/TestNotificationButton'
import Tutorial from '../components/Tutorial'
import PatientDetails from '../pages/PatientDetails'
import TestButtons from '../components/TestButtons'

const Dashboard: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<string>('summary')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const { user } = useAuth()
  const [showTutorial, setShowTutorial] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    console.log('Usuario actual:', user)
    console.log('Rol del usuario:', user?.role)
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [user])

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id)
  }

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleItemClick = (itemId: string) => {
    setActiveComponent(itemId);
    if (itemId === 'patients') {
      toggleExpand(itemId);
    }
  };

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
          ? <TreatmentPlan patientId={user.id}  /> 
          : selectedPatientId
            ? <TreatmentPlan patientId={selectedPatientId}  />
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

  interface NavItem {
    icon: React.ReactNode;
    title: string;
    id: string;
    subItems?: NavItem[];
  }

  const navItems: NavItem[] = [
    { icon: <BarChart size={24} />, title: "Resumen", id: 'summary' },
    { icon: <Calendar size={24} />, title: "Citas", id: 'appointments' },
    { icon: <MessageSquare size={24} />, title: "Mensajes", id: 'chat' },
    { icon: <User size={24} />, title: "Perfil", id: 'profile' }
  ]

  if (user?.role && user.role !== UserRole.PACIENTE) {
    const patientSubItems: NavItem[] = [
      { icon: <FileText size={24} />, title: "Historial Médico", id: 'medical-history' },
      { icon: <Activity size={24} />, title: "Plan de Ejercicios", id: 'exercise-plan' },
      { icon: <ClipboardList size={24} />, title: "Plan de Tratamiento", id: 'treatment-plan' },
      { icon: <Target size={24} />, title: "Objetivos", id: 'goals' },
      { icon: <TrendingUp size={24} />, title: "Progreso del Paciente", id: 'progress' },
    ]
    navItems.splice(1, 0, { 
      icon: <Users size={24} />, 
      title: "Pacientes", 
      id: 'patients',
      subItems: patientSubItems
    })
  }

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

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
            <div key={item.id}>
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-200 ${activeComponent === item.id ? 'bg-gray-200' : ''}`}
              >
                <div className="flex items-center">
                  {item.icon}
                  <span className={`ml-2 ${isSidebarOpen ? 'block' : 'hidden'}`}>{item.title}</span>
                </div>
                {item.subItems && isSidebarOpen && (
                  expandedItems.includes(item.id) ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )
                )}
              </button>
              {item.subItems && expandedItems.includes(item.id) && (
                <div className="ml-4">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => setActiveComponent(subItem.id)}
                      className={`w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 ${activeComponent === subItem.id ? 'bg-gray-200' : ''}`}
                    >
                      {subItem.icon}
                      <span className={`ml-2 ${isSidebarOpen ? 'block' : 'hidden'}`}>{subItem.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ... Header ... */}
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            <div>
               <TestButtons />
              {renderComponent()}
              
              {/* Renderización condicional de PatientDetails */}
              {selectedPatientId && <PatientDetails patientId={selectedPatientId} />}
            </div>
          </div>
        </main>
      </div>
      {showTutorial && (
        <Tutorial onClose={handleCloseTutorial} />
      )}
      {/* <TestNotificationButton /> */}
    </div>
  )
}

export default Dashboard
