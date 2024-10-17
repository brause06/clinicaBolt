import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/api'
import { UserRole } from '../types/user'

interface Cita {
  id: number
  date: string
  patient: { id: number; name: string }
  physicianName: string
  status: string
  notes?: string
}

interface Patient {
  id: number
  name: string
}

const AppointmentScheduler: React.FC = () => {
  const { user, token } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)
  const [notes, setNotes] = useState<string>('')
  const [reasonForVisit, setReasonForVisit] = useState<string>('')
  const [appointments, setAppointments] = useState<Cita[]>([])
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    if (token) {
      fetchAppointments()
      if (user?.role !== UserRole.PACIENTE) {
        fetchPatients()
      }
    }
  }, [token, user])

  const fetchAppointments = async () => {
    try {
      let response
      if (user?.role === UserRole.PACIENTE) {
        response = await api.get(`/pacientes/${user.id}/citas`)
      } else {
        response = await api.get('/citas')
      }
      setAppointments(response.data)
    } catch (error) {
      console.error('Error al obtener citas:', error)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await api.get('/pacientes')
      setPatients(response.data.pacientes)
    } catch (error) {
      console.error('Error al obtener pacientes:', error)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime('')
    setSelectedPatient(null)
    setNotes('')
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleBookAppointment = async () => {
    if (user?.role === UserRole.PACIENTE) return

    if (selectedDate && selectedTime && selectedPatient) {
      try {
        const newAppointment = {
          date: new Date(selectedDate.setHours(parseInt(selectedTime.split(':')[0]), parseInt(selectedTime.split(':')[1]))).toISOString(),
          patientId: selectedPatient,
          physicianName: user?.username || 'Dr. Asignado',
          status: 'scheduled',
          notes: notes,
          duration: 30,
          reasonForVisit: reasonForVisit
        }
        const response = await api.post('/citas', newAppointment)
        setAppointments([...appointments, response.data])
        alert(`Cita reservada para ${response.data.patient.name} el ${new Date(response.data.date).toLocaleDateString()} a las ${new Date(response.data.date).toLocaleTimeString()}`)
        resetForm()
      } catch (error) {
        console.error('Error al crear la cita:', error)
        alert('Hubo un error al reservar la cita. Por favor, inténtelo de nuevo.')
      }
    } else {
      alert('Por favor, selecciona una fecha, hora y paciente para la cita.')
    }
  }

  const handleCancelAppointment = async (id: number) => {
    if (user?.role === UserRole.PACIENTE) return

    try {
      await api.put(`/citas/${id}`, { status: 'cancelled' })
      setAppointments(appointments.map(app => 
        app.id === id ? { ...app, status: 'cancelled' } : app
      ))
    } catch (error) {
      console.error('Error al cancelar la cita:', error)
      alert('Hubo un error al cancelar la cita. Por favor, inténtelo de nuevo.')
    }
  }

  const resetForm = () => {
    setSelectedDate(null)
    setSelectedTime('')
    setSelectedPatient(null)
    setNotes('')
    setReasonForVisit('')
  }

  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

  const renderCalendar = () => {
    if (user?.role === UserRole.PACIENTE) return null

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-2">
            <ChevronLeft />
          </button>
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={handleNextMonth} className="p-2">
            <ChevronRight />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center font-semibold">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1)
            const isSelected = selectedDate?.toDateString() === date.toDateString()
            const hasAppointment = appointments.some(
              app => new Date(app.date).toDateString() === date.toDateString() && app.status !== 'cancelled'
            )
            return (
              <button
                key={index}
                onClick={() => handleDateSelect(date)}
                className={`p-2 rounded-full ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : hasAppointment
                    ? 'bg-green-200'
                    : 'hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </>
    )
  }

  const renderAppointmentForm = () => {
    if (user?.role === UserRole.PACIENTE) return null

    return (
      <>
        {selectedDate && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Horarios disponibles para {selectedDate.toLocaleDateString()}:</h4>
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 rounded ${
                    selectedTime === time ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}
        {selectedDate && selectedTime && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Seleccionar paciente:</h4>
            <select
              value={selectedPatient || ''}
              onChange={(e) => setSelectedPatient(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Seleccione un paciente</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
          </div>
        )}
        {selectedDate && selectedTime && selectedPatient && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Notas adicionales:</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Añade notas sobre la cita aquí..."
            />
          </div>
        )}
        {selectedDate && selectedTime && selectedPatient && (
          <button
            onClick={handleBookAppointment}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" /> Reservar Cita
          </button>
        )}
      </>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        {user?.role === UserRole.PACIENTE ? "Mis Citas" : "Programar Cita"}
      </h2>
      {renderCalendar()}
      {renderAppointmentForm()}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Citas Programadas</h3>
        <ul className="space-y-2">
          {appointments.map(appointment => (
            <li key={appointment.id} className="bg-gray-100 p-3 rounded-md flex justify-between items-center">
              <div>
                <p><strong>Fecha:</strong> {new Date(appointment.date).toLocaleString()}</p>
                {user?.role !== UserRole.PACIENTE && (
                  <p><strong>Paciente:</strong> {appointment.patient.name}</p>
                )}
                <p><strong>Fisioterapeuta:</strong> {appointment.physicianName}</p>
                <p><strong>Estado:</strong> {appointment.status}</p>
                {appointment.notes && <p><strong>Notas:</strong> {appointment.notes}</p>}
              </div>
              {user?.role !== UserRole.PACIENTE && appointment.status !== 'cancelled' && (
                <button
                  onClick={() => handleCancelAppointment(appointment.id)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default AppointmentScheduler
