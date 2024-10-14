import React, { useState, useEffect } from 'react'
import { FileText, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types/user';

interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
}

interface MedicalHistoryProps {
  patientId: string;
}

const MedicalHistory: React.FC<MedicalHistoryProps> = ({ patientId }) => {
  const { user } = useAuth()
  const [records, setRecords] = useState<MedicalRecord[]>([
    { id: '1', date: '2023-03-15', diagnosis: 'Esguince de tobillo', treatment: 'Fisioterapia y reposo' },
    { id: '2', date: '2023-01-10', diagnosis: 'Dolor lumbar', treatment: 'Ejercicios de fortalecimiento' },
  ])
  const [newRecord, setNewRecord] = useState({ date: '', diagnosis: '', treatment: '' })

  useEffect(() => {
    // Cargar historial médico específico del paciente usando patientId
    console.log(`Cargando historial médico para el paciente ${patientId}`);
    // ... lógica para cargar historial médico ...
  }, [patientId]);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault()
    if (newRecord.date && newRecord.diagnosis && newRecord.treatment) {
      setRecords([...records, { id: Date.now().toString(), ...newRecord }])
      setNewRecord({ date: '', diagnosis: '', treatment: '' })
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Historial Médico</h2>
      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.id} className="border-b pb-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="font-medium">{record.date}</span>
            </div>
            <p><strong>Diagnóstico:</strong> {record.diagnosis}</p>
            <p><strong>Tratamiento:</strong> {record.treatment}</p>
          </div>
        ))}
      </div>
      {user?.role === UserRole.FISIOTERAPEUTA && (
        <form onSubmit={handleAddRecord} className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold mb-2">Agregar Nuevo Registro</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={newRecord.date}
              onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
              className="w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
            <input
              type="text"
              value={newRecord.diagnosis}
              onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
              className="w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento</label>
            <textarea
              value={newRecord.treatment}
              onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
              className="w-full border rounded-md p-2"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 flex items-center">
            <Plus className="w-5 h-5 mr-2" /> Agregar Registro
          </button>
        </form>
      )}
    </div>
  )
}

export default MedicalHistory
