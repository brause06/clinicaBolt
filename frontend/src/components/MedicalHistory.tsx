import React, { useState, useEffect } from 'react'
import { FileText, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../api/api'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types/user'
import axios from 'axios'
import ImageModal from './ImageModal'

interface MedicalRecord {
  id: number;
  fecha: string;
  diagnostico: string;
  tratamiento: string;
  fotoInicial?: string;
  fotoFinal?: string;
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
  const [fotoInicial, setFotoInicial] = useState<File | null>(null)
  const [fotoFinal, setFotoFinal] = useState<File | null>(null)
  const [editingRecord, setEditingRecord] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null)

  useEffect(() => {
    fetchMedicalHistory()
  }, [patientId, user])

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true)
      const id = user?.role === UserRole.PACIENTE ? user.id : patientId
      const response = await api.get(`/pacientes/${id}/historial-medico`)
      setRecords(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error al obtener el historial médico:', error)
      setError('Error al cargar el historial médico. Por favor, intenta de nuevo más tarde.')
      setLoading(false)
    }
  }

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === UserRole.PACIENTE) return;

    const formData = new FormData();
    formData.append('fecha', newRecord.fecha);
    formData.append('diagnostico', newRecord.diagnostico);
    formData.append('tratamiento', newRecord.tratamiento);
    if (fotoInicial) {
      formData.append('fotoInicial', fotoInicial);
    }

    try {
      const response = await api.post(`/pacientes/${patientId}/historial-medico`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setRecords([...records, response.data])
      setNewRecord({ fecha: '', diagnostico: '', tratamiento: '' })
      setFotoInicial(null)
      setError(null)
    } catch (error) {
      console.error('Error al agregar registro médico:', error)
      if (axios.isAxiosError(error) && error.response) {
        setError(`Error al agregar el registro médico: ${error.response.data.message}`);
      } else {
        setError('Error al agregar el registro médico. Por favor, intenta de nuevo.');
      }
    }
  }

  const handleUpdateRecord = async (id: number) => {
    if (user?.role === UserRole.PACIENTE) return;

    const formData = new FormData();
    if (fotoFinal) formData.append('fotoFinal', fotoFinal);

    try {
      const response = await api.put(`/pacientes/${patientId}/historial-medico/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setRecords(records.map(record => record.id === id ? response.data : record));
      setEditingRecord(null);
      setFotoFinal(null);
      setError(null);
    } catch (error) {
      console.error('Error al actualizar registro médico:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(`Error al actualizar el registro médico: ${error.response.data.message}`);
      } else {
        setError('Error al actualizar el registro médico. Por favor, intenta de nuevo.');
      }
    }
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Error al cargar la imagen:', e.currentTarget.src);
    e.currentTarget.src = 'https://via.placeholder.com/150?text=Imagen+no+disponible';
    e.currentTarget.onerror = null;
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(`${import.meta.env.VITE_API_URL}/uploads/${imageUrl}`)
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
  }

  const toggleRecordExpansion = (id: number) => {
    setExpandedRecord(expandedRecord === id ? null : id)
  }

  if (loading) return <div className="text-center py-4">Cargando historial médico...</div>
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" id="medical-history-title">Historial Médico</h2>
      <div role="region" aria-labelledby="medical-history-title">
        {records.length > 0 ? (
          <ul className="space-y-4 sm:space-y-6 list-none">
            {records.map((record) => (
              <li key={record.id} className="border-b pb-4 sm:pb-6">
                <div 
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => toggleRecordExpansion(record.id)}
                  onKeyPress={(e) => e.key === 'Enter' && toggleRecordExpansion(record.id)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={expandedRecord === record.id}
                  aria-controls={`record-content-${record.id}`}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-500" aria-hidden="true" />
                    <span className="font-medium">{new Date(record.fecha).toLocaleDateString()}</span>
                  </div>
                  {expandedRecord === record.id ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
                </div>
                {expandedRecord === record.id && (
                  <div id={`record-content-${record.id}`}>
                    <p className="mb-1"><strong>Diagnóstico:</strong> {record.diagnostico}</p>
                    <p className="mb-2"><strong>Tratamiento:</strong> {record.tratamiento}</p>
                    <div className="flex flex-wrap gap-4">
                      {record.fotoInicial && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Foto inicial:</p>
                          <img 
                            src={`${import.meta.env.VITE_API_URL}/uploads/${record.fotoInicial}`}
                            alt={`Foto inicial del ${new Date(record.fecha).toLocaleDateString()}`}
                            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md cursor-pointer" 
                            onError={handleImageError}
                            onClick={() => handleImageClick(record.fotoInicial!)}
                            onKeyPress={(e) => e.key === 'Enter' && handleImageClick(record.fotoInicial!)}
                            tabIndex={0}
                          />
                        </div>
                      )}
                      {record.fotoFinal && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Foto final:</p>
                          <img 
                            src={`${import.meta.env.VITE_API_URL}/uploads/${record.fotoFinal}`}
                            alt={`Foto final del ${new Date(record.fecha).toLocaleDateString()}`}
                            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md cursor-pointer" 
                            onError={handleImageError}
                            onClick={() => handleImageClick(record.fotoFinal!)}
                            onKeyPress={(e) => e.key === 'Enter' && handleImageClick(record.fotoFinal!)}
                            tabIndex={0}
                          />
                        </div>
                      )}
                    </div>
                    {user?.role !== UserRole.PACIENTE && !record.fotoFinal && (
                      <button
                        onClick={() => setEditingRecord(record.id)}
                        className="mt-2 text-blue-500 hover:text-blue-700"
                        aria-label="Agregar foto final"
                      >
                        Agregar foto final
                      </button>
                    )}
                    {editingRecord === record.id && (
                      <div className="mt-4">
                        <label htmlFor={`foto-final-${record.id}`} className="block mb-2 text-sm font-medium text-gray-700">
                          Seleccionar foto final:
                        </label>
                        <input
                          id={`foto-final-${record.id}`}
                          type="file"
                          onChange={(e) => setFotoFinal(e.target.files ? e.target.files[0] : null)}
                          accept="image/*"
                          className="mb-2"
                          aria-describedby={`foto-final-help-${record.id}`}
                        />
                        <p id={`foto-final-help-${record.id}`} className="text-sm text-gray-500 mb-2">
                          Seleccione una imagen para la foto final del tratamiento.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleUpdateRecord(record.id)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            aria-label="Guardar foto final"
                          >
                            Guardar foto final
                          </button>
                          <button
                            onClick={() => setEditingRecord(null)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                            aria-label="Cancelar subida de foto final"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500" role="status">No hay registros médicos para este paciente.</p>
        )}
      </div>
      {user?.role !== UserRole.PACIENTE && (
        <form onSubmit={handleAddRecord} className="mt-6 space-y-4">
          <h3 className="text-lg font-medium mb-2">Agregar nuevo registro</h3>
          <div>
            <label htmlFor="fecha" className="block mb-2 text-sm font-medium text-gray-700">Fecha:</label>
            <input
              id="fecha"
              type="date"
              value={newRecord.fecha}
              onChange={(e) => setNewRecord({ ...newRecord, fecha: e.target.value })}
              className="w-full border rounded-md p-2"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="diagnostico" className="block mb-2 text-sm font-medium text-gray-700">Diagnóstico:</label>
            <input
              id="diagnostico"
              type="text"
              placeholder="Diagnóstico"
              value={newRecord.diagnostico}
              onChange={(e) => setNewRecord({ ...newRecord, diagnostico: e.target.value })}
              className="w-full border rounded-md p-2"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="tratamiento" className="block mb-2 text-sm font-medium text-gray-700">Tratamiento:</label>
            <textarea
              id="tratamiento"
              placeholder="Tratamiento"
              value={newRecord.tratamiento}
              onChange={(e) => setNewRecord({ ...newRecord, tratamiento: e.target.value })}
              className="w-full border rounded-md p-2"
              rows={3}
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="fotoInicial" className="block mb-2 text-sm font-medium text-gray-700">
              Foto inicial:
            </label>
            <input
              id="fotoInicial"
              type="file"
              onChange={(e) => setFotoInicial(e.target.files ? e.target.files[0] : null)}
              accept="image/*"
              className="w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              aria-describedby="fotoInicial-help"
            />
            <p id="fotoInicial-help" className="text-sm text-gray-500 mt-1">
              Seleccione una imagen para la foto inicial del tratamiento (opcional).
            </p>
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
            aria-label="Agregar nuevo registro médico"
          >
            <Plus className="w-5 h-5 mr-2" aria-hidden="true" /> Agregar Registro
          </button>
        </form>
      )}
      {selectedImage && (
        <ImageModal imageUrl={selectedImage} onClose={handleCloseModal} />
      )}
    </div>
  )
}

export default MedicalHistory
