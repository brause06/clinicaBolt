import React, { useState } from 'react'
import { Users, Search, ChevronDown, Plus, Edit, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Patient {
  id: string;
  name: string;
  age: number;
  condition?: string;
  lastAppointment?: string;
}

interface PatientListProps {
  onSelectPatient: (patient: Patient) => void;
  selectedPatientId: string | null;
}

const PatientList: React.FC<PatientListProps> = ({ onSelectPatient, selectedPatientId }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<keyof Patient>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Mock patient data
  const [patients, setPatients] = useState<Patient[]>([
    { id: '1', name: 'Juan Pérez', age: 35, condition: 'Lumbalgia', lastAppointment: '2023-04-15' },
    { id: '2', name: 'María García', age: 28, condition: 'Tendinitis', lastAppointment: '2023-04-20' },
    { id: '3', name: 'Carlos Rodríguez', age: 45, condition: 'Artritis', lastAppointment: '2023-04-18' },
  ])

  const handleSort = (key: keyof Patient) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.condition && patient.condition.toLowerCase().includes(searchTerm.toLowerCase())) ||
    patient.age.toString().includes(searchTerm) ||
    (patient.lastAppointment && patient.lastAppointment.includes(searchTerm))
  ).sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    if (aValue === undefined || bValue === undefined) return 0
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Lista de Pacientes</h2>
        <Link to="/add-patient" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Agregar Paciente
        </Link>
      </div>
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Buscar pacientes por nombre, condición, edad o última cita..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('name')}>
                Nombre {sortBy === 'name' && <ChevronDown className="inline" size={16} />}
              </th>
              <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('age')}>
                Edad {sortBy === 'age' && <ChevronDown className="inline" size={16} />}
              </th>
              <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('condition')}>
                Condición {sortBy === 'condition' && <ChevronDown className="inline" size={16} />}
              </th>
              <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('lastAppointment')}>
                Última Cita {sortBy === 'lastAppointment' && <ChevronDown className="inline" size={16} />}
              </th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className={`border-b ${selectedPatientId === patient.id ? 'bg-blue-100' : ''}`}>
                <td className="px-4 py-2">{patient.name}</td>
                <td className="px-4 py-2">{patient.age}</td>
                <td className="px-4 py-2">{patient.condition || 'N/A'}</td>
                <td className="px-4 py-2">{patient.lastAppointment || 'N/A'}</td>
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onSelectPatient(patient)} 
                      className={`text-blue-500 hover:text-blue-700 ${selectedPatientId === patient.id ? 'font-bold' : ''}`}
                    >
                      {selectedPatientId === patient.id ? 'Seleccionado' : 'Seleccionar'}
                    </button>
                    <Link to={`/patient/${patient.id}/edit`} className="text-green-500 hover:text-green-700">
                      <Edit className="w-5 h-5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PatientList