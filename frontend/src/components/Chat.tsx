import React, { useState, useEffect, useRef } from 'react'
import { Send, Check, Clock, User as UserIcon } from 'lucide-react'
import api from '../api/api'
import { useAuth } from '../contexts/AuthContext'
import { PacienteBasico, UserRole } from '../types/user'
import axios from 'axios'
import { User } from '../types/user'

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
  const [selectedPaciente, setSelectedPaciente] = useState<number | null>(null)
  const [pacientes, setPacientes] = useState<PacienteBasico[]>([])
  const [fisioterapeutas, setFisioterapeutas] = useState<User[]>([])
  const [selectedFisioterapeuta, setSelectedFisioterapeuta] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (user?.role === UserRole.PACIENTE) {
          const fisioterapeutasData = await fetchFisioterapeutas();
          if (isMounted) {
            setFisioterapeutas(fisioterapeutasData);
          }
        } else {
          const pacientesData = await fetchPacientes();
          if (isMounted) {
            setPacientes(pacientesData);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
        if (isMounted) {
          setError("Error al cargar la lista. Por favor, intenta de nuevo más tarde.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [user]);

  useEffect(() => {
    if (user?.role === UserRole.PACIENTE && selectedFisioterapeuta) {
      fetchMessages(user.id, selectedFisioterapeuta);
    } else if (selectedPaciente) {
      fetchMessages(user?.id ?? 0, selectedPaciente);
    }
  }, [selectedPaciente, selectedFisioterapeuta, user]);

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

  const fetchMessages = async (emisorId: number, receptorId: number) => {
    try {
      const response = await api.get(`/mensajes/conversacion/${emisorId}/${receptorId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error al obtener los mensajes:', error);
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const receptorId = user?.role === UserRole.PACIENTE ? selectedFisioterapeuta : selectedPaciente;
    if (!receptorId) return;

    try {
      const response = await api.post(`/mensajes/enviar/${user?.id}/${receptorId}`, { contenido: newMessage });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  }

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const fetchFisioterapeutas = async (): Promise<User[]> => {
    console.log('Iniciando fetchFisioterapeutas');
    try {
      console.log('Token:', localStorage.getItem('token'));
      console.log('Haciendo petición a /users');
      const response = await api.get<User[]>('/users');
      console.log('Respuesta de fetchFisioterapeutas:', response.data);
      return response.data.filter(user => user.role === UserRole.FISIOTERAPEUTA);
    } catch (error) {
      console.error('Error al obtener la lista de fisioterapeutas:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detalles del error:', error.response?.data);
        console.error('Estado de la respuesta:', error.response?.status);
        console.error('Cabeceras de la respuesta:', error.response?.headers);
      }
      throw error;
    }
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <div className="bg-orange-500 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Chat de Fisioterapia</h1>
      </div>
      <div className="flex-grow flex">
        <div className="w-1/3 bg-white border-r overflow-y-auto">
          {isLoading ? (
            <p className="p-4">Cargando...</p>
          ) : user?.role === UserRole.PACIENTE ? (
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Fisioterapeutas</h2>
              {fisioterapeutas.map((fisio) => (
                <div
                  key={fisio.id}
                  onClick={() => setSelectedFisioterapeuta(fisio.id)}
                  className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer ${
                    selectedFisioterapeuta === fisio.id ? 'bg-gray-200' : ''
                  }`}
                >
                  <UserIcon className="w-10 h-10 rounded-full bg-gray-300 p-2 mr-3" />
                  <span>{fisio.username}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Pacientes ({pacientes.length})</h2>
              {pacientes.map((paciente) => (
                <div
                  key={paciente.id}
                  onClick={() => setSelectedPaciente(paciente.id)}
                  className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer ${
                    selectedPaciente === paciente.id ? 'bg-gray-200' : ''
                  }`}
                >
                  <UserIcon className="w-10 h-10 rounded-full bg-gray-300 p-2 mr-3" />
                  <span>{paciente.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-2/3 flex flex-col">
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <p>Cargando mensajes...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.emisor.id === user?.id?.toString() ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-lg p-3 ${message.emisor.id === user?.id?.toString() ? 'bg-green-500 text-white' : 'bg-white shadow'}`}>
                    <p className="font-bold text-sm">{message.emisor.username}</p>
                    <p className="mt-1">{message.contenido}</p>
                    <div className="flex justify-end items-center mt-1">
                      <p className="text-xs opacity-70">{formatTimestamp(message.fechaEnvio)}</p>
                      {message.emisor.id === user?.id?.toString() && (
                        <div className="ml-2">{message.leido ? <Check className="w-3 h-3 text-blue-400" /> : <Clock className="w-3 h-3 text-gray-400" />}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="bg-white p-4 border-t flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow border rounded-full py-2 px-4 mr-2"
              placeholder="Escribe un mensaje..."
            />
            <button type="submit" className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition duration-300">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chat
