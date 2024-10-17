import React, { useState, useEffect } from 'react'
import { FileText, Plus } from 'lucide-react'
import api from '../api/api'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types/user'

interface MedicalRecord {
  id: number;
  fecha: string;
  diagnostico: string;
  tratamiento: string;
}

interface MedicalHistoryProps {
  patientId: number;
}

const MedicalHistory: React.FC<MedicalHistoryProps> = ({ patientId }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [newRecord, setNewRecord] = useState({ fecha: '', diagnostico: '', tratamiento: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchMedicalHistory()
  }, [patientId, user])

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true)
      const id = user?.role === UserRole.PACIENTE ? user.id : patientId
      const response = await api.get(`/pacientes/${id}/historial-medico`)
      console.log("Respuesta del servidor:", response.data);
      setRecords(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error al obtener el historial médico:', error)
      setError('Error al cargar el historial médico')
      setLoading(false)
    }
  }

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user?.role === UserRole.PACIENTE) return // Prevenir que los pacientes añaden registros

    try {
      const response = await api.post(`/pacientes/${patientId}/historial-medico`, newRecord)
      setRecords([...records, response.data])
      setNewRecord({ fecha: '', diagnostico: '', tratamiento: '' })
    } catch (error) {
      console.error('Error al agregar registro médico:', error)
      setError('Error al agregar el registro médico')
    }
  }

  if (loading) return <div>Cargando historial médico...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Historial Médico</h2>
      {records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="border-b pb-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="font-medium">{new Date(record.fecha).toLocaleDateString()}</span>
              </div>
              <p><strong>Diagnóstico:</strong> {record.diagnostico}</p>
              <p><strong>Tratamiento:</strong> {record.tratamiento}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay registros médicos para este paciente.</p>
      )}
      {user?.role !== UserRole.PACIENTE && (
        <form onSubmit={handleAddRecord} className="mt-6 space-y-4">
          <input
            type="date"
            value={newRecord.fecha}
            onChange={(e) => setNewRecord({ ...newRecord, fecha: e.target.value })}
            className="w-full border rounded-md p-2"
            required
          />
          <input
            type="text"
            placeholder="Diagnóstico"
            value={newRecord.diagnostico}
            onChange={(e) => setNewRecord({ ...newRecord, diagnostico: e.target.value })}
            className="w-full border rounded-md p-2"
            required
          />
          <input
            type="text"
            placeholder="Tratamiento"
            value={newRecord.tratamiento}
            onChange={(e) => setNewRecord({ ...newRecord, tratamiento: e.target.value })}
            className="w-full border rounded-md p-2"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center">
            <Plus className="w-5 h-5 mr-2" /> Agregar Registro
          </button>
        </form>
      )}
    </div>
  )
}

export default MedicalHistory
