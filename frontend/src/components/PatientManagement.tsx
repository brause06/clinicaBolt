import React, { useState, useCallback, useEffect, useMemo } from 'react'
import PatientList from './PatientList'
import axios from 'axios'
import { Patient } from '../types/patient'

interface PatientManagementProps {
  onSelectPatient: (patient: Patient) => void;
  selectedPatientId: number | null;
}

const PatientManagement: React.FC<PatientManagementProps> = ({ onSelectPatient, selectedPatientId }) => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<keyof Patient>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get<{ pacientes: Patient[] }>('/api/pacientes', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPatients(response.data.pacientes)
    } catch (error) {
      console.error('Error fetching patients:', error)
      setError('Error al cargar los pacientes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const handleSort = useCallback((key: keyof Patient) => {
    setSortBy(key)
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }, [])

  const filteredAndSortedPatients = useMemo(() => {
    return patients
      .filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.condition && patient.condition.toLowerCase().includes(searchTerm.toLowerCase())) ||
        patient.age.toString().includes(searchTerm) ||
        (patient.lastAppointment && patient.lastAppointment.includes(searchTerm))
      )
      .sort((a, b) => {
        const aValue = a[sortBy]
        const bValue = b[sortBy]
        if (aValue === undefined || bValue === undefined) return 0
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
  }, [patients, searchTerm, sortBy, sortOrder])

  const handleSelectPatient = useCallback((patient: Patient) => {
    onSelectPatient(patient);
  }, [onSelectPatient]);

  if (loading) return <div>Cargando pacientes...</div>
  if (error) return <div>{error}</div>

  return (
    <PatientList
      patients={filteredAndSortedPatients}
      onSelectPatient={handleSelectPatient}
      selectedPatientId={selectedPatientId}
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={handleSort}
    />
  )
}

export default PatientManagement
