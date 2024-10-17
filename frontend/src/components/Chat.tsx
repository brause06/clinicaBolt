import React, { useState, useEffect, useRef } from 'react'
import { Send, Check, Clock } from 'lucide-react'
import api from '../api/api'
import { useAuth } from '../contexts/AuthContext'
import { PacienteBasico, UserRole } from '../types/user'
import axios from 'axios'

interface Message {
  id: string
  contenido: string
  fechaEnvio: Date
  emisor: { id: string; username: string }
  receptor: { id: string; username: string }
  leido: boolean
}

interface PacientesResponse {
  pacientes: PacienteBasico[];
  total: number;
  page: number;
  totalPages: number;
}

const Chat: React.FC = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedPaciente, setSelectedPaciente] = useState<string>('')
  const [pacientes, setPacientes] = useState<PacienteBasico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const pacientesData = await fetchPacientes();
        if (isMounted) {
          setPacientes(pacientesData);
        }
      } catch (error) {
        console.error("Error al obtener pacientes:", error);
        if (isMounted) {
          setError("Error al cargar la lista de pacientes. Por favor, intenta de nuevo más tarde.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (selectedPaciente) {
      fetchMessages()
    }
  }, [selectedPaciente])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchPacientes = async (): Promise<PacienteBasico[]> => {
    console.log('Iniciando fetchPacientes');
    try {
      console.log('Token:', localStorage.getItem('token'));
      console.log('Haciendo petición a /pacientes');
      const response = await api.get<PacientesResponse>('/pacientes');
      console.log('Respuesta de fetchPacientes:', response.data);
      return response.data.pacientes;
    } catch (error) {
      console.error('Error al obtener la lista de pacientes:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detalles del error:', error.response?.data);
        console.error('Estado de la respuesta:', error.response?.status);
        console.error('Cabeceras de la respuesta:', error.response?.headers);
      }
      throw error;
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/mensajes/conversacion/${user?.id}/${selectedPaciente}`)
      setMessages(response.data)
    } catch (error) {
      console.error('Error al obtener los mensajes:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && selectedPaciente) {
      try {
        const response = await api.post(`/mensajes/enviar/${user?.id}/${selectedPaciente}`, { contenido: newMessage })
        setMessages([...messages, response.data])
        setNewMessage('')
      } catch (error) {
        console.error('Error al enviar el mensaje:', error)
      }
    }
  }

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-[600px] flex flex-col">
      <h2 className="text-2xl font-semibold mb-4">Chat</h2>
      {user?.role === UserRole.FISIOTERAPEUTA && (
        <div className="mb-4">
          <label htmlFor="paciente-select" className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona un paciente
          </label>
          <select
            id="paciente-select"
            value={selectedPaciente}
            onChange={(e) => setSelectedPaciente(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Selecciona un paciente</option>
            {pacientes.map((paciente) => (
              <option key={paciente.id} value={paciente.id}>
                {paciente.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex-grow overflow-y-auto mb-4 space-y-4">
        {isLoading ? (
          <p>Cargando pacientes...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.emisor.id === user?.id?.toString() ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg p-3 ${message.emisor.id === user?.id?.toString() ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                <p className="font-bold">{message.emisor.username}</p>
                <p>{message.contenido}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs">{formatTimestamp(message.fechaEnvio)}</p>
                  {message.emisor.id === user?.id?.toString() && (
                    <div className="ml-2">{message.leido ? <Check className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-gray-400" />}</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow border rounded-md p-2"
          placeholder="Escribe un mensaje..."
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}

export default Chat
