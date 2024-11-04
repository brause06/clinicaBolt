import React, { useState, useEffect, useRef } from 'react';
import { Send, Check, User as UserIcon, Paperclip, Search, Volume2, VolumeX } from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { PacienteBasico, UserRole } from '../types/user';
import { User } from '../types/user';
import { io, Socket } from 'socket.io-client';
import { debounce } from 'lodash';
import axios from 'axios';

interface Message {
  id: string;
  contenido: string;
  fechaEnvio: Date;
  emisor: { 
    id: string;
    username: string;
    profileImageUrl?: string;
  };
  receptor: { 
    id: string;
    username: string;
    profileImageUrl?: string;
  };
  leido: boolean;
  adjuntoUrl?: string;
  tipoAdjunto?: string;
}

interface PacientesResponse {
  pacientes: PacienteBasico[];
  total: number;
  page: number;
  totalPages: number;
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedPaciente, setSelectedPaciente] = useState<number | null>(null);
  const [pacientes, setPacientes] = useState<PacienteBasico[]>([]);
  const [fisioterapeutas, setFisioterapeutas] = useState<User[]>([]);
  const [selectedFisioterapeuta, setSelectedFisioterapeuta] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [usuariosEnLinea, setUsuariosEnLinea] = useState<string[]>([]);
  const [usuariosEscribiendo, setUsuariosEscribiendo] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messageSound = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    messageSound.current = new Audio('/message-notification.mp3');
    
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: { userId: user?.id }
    });

    socket.on('connect', () => {
      console.log('Conectado al servidor de WebSocket');
    });

    socket.on('nuevoMensaje', (mensaje: Message) => {
      setMessages(prev => [...prev, mensaje]);
      if (soundEnabled && mensaje.emisor.id !== user?.id?.toString()) {
        messageSound.current?.play();
      }
    });

    socket.on('mensajeActualizado', (mensaje: Message) => {
      setMessages(prev => prev.map(m => m.id === mensaje.id ? mensaje : m));
    });

    socket.on('mensajesLeidos', ({ mensajesIds }) => {
      setMessages(prev => prev.map(m => 
        mensajesIds.includes(m.id) ? { ...m, leido: true } : m
      ));
    });

    socket.on('usuarioConectado', ({ userId }) => {
      setUsuariosEnLinea(prev => [...prev, userId]);
    });

    socket.on('usuarioDesconectado', ({ userId }) => {
      setUsuariosEnLinea(prev => prev.filter(id => id !== userId));
    });

    socket.on('estaEscribiendo', ({ emisorId }) => {
      setUsuariosEscribiendo(prev => [...prev, emisorId]);
    });

    socket.on('dejoDeEscribir', ({ emisorId }) => {
      setUsuariosEscribiendo(prev => prev.filter(id => id !== emisorId));
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [user?.id, soundEnabled]);

  useEffect(() => {
    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            if (user?.role === UserRole.PACIENTE) {
                const fisios = await fetchFisioterapeutas();
                setFisioterapeutas(fisios);
            } else {
                const pacientesList = await fetchPacientes();
                setPacientes(pacientesList);
            }
        } catch (error) {
            setError('Error al obtener datos');
            console.error('Error al obtener datos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.id) {
        loadInitialData();
    }
}, [user]);

  useEffect(() => {
    if (user?.id && (selectedPaciente || selectedFisioterapeuta)) {
        const receptorId = user.role === UserRole.PACIENTE ? 
            selectedFisioterapeuta! : selectedPaciente!;
        setPage(1);
        fetchMessages(user.id, receptorId);
    }
}, [user?.id, selectedPaciente, selectedFisioterapeuta]);

  useEffect(() => {
    if (user?.id && (selectedPaciente || selectedFisioterapeuta)) {
        const receptorId = user.role === UserRole.PACIENTE ? 
            selectedFisioterapeuta! : selectedPaciente!;
        fetchMessages(user.id, receptorId);
    }
}, [page]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchPacientes = async (): Promise<PacienteBasico[]> => {
    try {
      const response = await api.get<PacientesResponse>('/pacientes');
      return response.data.pacientes;
    } catch (error) {
      console.error('Error al obtener la lista de pacientes:', error);
      throw error;
    }
  };

  const fetchMessages = async (emisorId: number, receptorId: number) => {
    try {
      console.log('Obteniendo mensajes entre:', { emisorId, receptorId });
      
      const response = await api.get(`/mensajes/conversacion/${emisorId}/${receptorId}`, {
        params: { page, limit: 50 }
      });
      
      console.log('Mensajes recibidos:', response.data);

      if (page === 1) {
        setMessages(response.data.mensajes);
      } else {
        setMessages(prev => [...response.data.mensajes, ...prev]);
      }
      
      setHasMore(response.data.page < response.data.totalPages);
    } catch (error) {
      console.error('Error al obtener los mensajes:', error);
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop } = containerRef.current;
      if (scrollTop === 0 && hasMore) {
        setPage(prev => prev + 1);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación inicial
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage && !selectedFile) {
      console.log('Mensaje vacío y sin archivo');
      return;
    }

    const receptorId = user?.role === UserRole.PACIENTE ? selectedFisioterapeuta : selectedPaciente;
    if (!receptorId || !user?.id) {
      console.error('Faltan datos necesarios para enviar el mensaje');
      return;
    }

    try {
      const formData = new FormData();
      
      // Asegurarse de que el contenido se envía correctamente
      formData.append('contenido', trimmedMessage);
      
      if (selectedFile) {
        formData.append('adjunto', selectedFile);
      }

      // Depuración del FormData
      console.log('Contenido del FormData:');
      for (const pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await api.post(
        `/mensajes/enviar/${user.id}/${receptorId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 201) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error detallado al enviar el mensaje:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Error al enviar el mensaje';
        // Aquí podrías mostrar un toast o alerta al usuario
        console.error('Mensaje de error:', errorMessage);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('El archivo es demasiado grande. El tamaño máximo es 5MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleTyping = debounce(() => {
    const receptorId = user?.role === UserRole.PACIENTE ? selectedFisioterapeuta : selectedPaciente;
    if (socket && receptorId) {
      socket.emit('escribiendo', { 
        emisorId: user?.id, 
        receptorId 
      });
    }
  }, 300);

  const fetchFisioterapeutas = async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>('/users/fisioterapeutas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener la lista de fisioterapeutas:', error);
      throw error;
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderFilePreview = (url: string, tipo: string) => {
    if (tipo.startsWith('image/')) {
      return <img src={url} alt="Adjunto" className="max-w-xs rounded-lg" />;
    } else {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          Ver archivo adjunto
        </a>
      );
    }
  };

  const renderProfileImage = (profileImageUrl?: string) => {
    if (profileImageUrl) {
      return (
        <div className="relative w-10 h-10">
          <img 
            src={`${import.meta.env.VITE_API_URL}${profileImageUrl}`} 
            alt="Perfil" 
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallbackIcon = target.parentElement?.querySelector('.fallback-icon');
              if (fallbackIcon) {
                fallbackIcon.classList.remove('hidden');
              }
            }}
          />
          <UserIcon className="w-10 h-10 rounded-full bg-gray-300 p-2 absolute top-0 left-0 fallback-icon hidden" />
        </div>
      );
    }
    return <UserIcon className="w-10 h-10 rounded-full bg-gray-300 p-2" />;
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="bg-orange-500 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat de Fisioterapia</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 hover:bg-orange-600 rounded-full"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="p-4">Cargando...</p>
            ) : user?.role === UserRole.PACIENTE ? (
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Fisioterapeutas</h2>
                {fisioterapeutas
                  .filter(fisio => 
                    fisio.username.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((fisio) => (
                    <div
                      key={fisio.id}
                      onClick={() => setSelectedFisioterapeuta(fisio.id)}
                      className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg ${
                        selectedFisioterapeuta === fisio.id ? 'bg-orange-50 border border-orange-200' : ''
                      }`}
                    >
                      <div className="relative">
                        {renderProfileImage(fisio.profileImageUrl)}
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          usuariosEnLinea.includes(fisio.id.toString()) ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="ml-3 flex-grow">
                        <span className="font-medium">{fisio.username}</span>
                        {usuariosEscribiendo.includes(fisio.id.toString()) && (
                          <p className="text-sm text-gray-500">Escribiendo...</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Pacientes ({pacientes.length})</h2>
                {pacientes
                  .filter(paciente => 
                    paciente.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((paciente) => (
                    <div
                      key={paciente.id}
                      onClick={() => setSelectedPaciente(paciente.id)}
                      className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg ${
                        selectedPaciente === paciente.id ? 'bg-orange-50 border border-orange-200' : ''
                      }`}
                    >
                      <div className="relative">
                        {renderProfileImage()} {/* Default icon for patients */}
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          usuariosEnLinea.includes(paciente.id.toString()) ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="ml-3 flex-grow">
                        <span className="font-medium">{paciente.name}</span>
                        {usuariosEscribiendo.includes(paciente.id.toString()) && (
                          <p className="text-sm text-gray-500">Escribiendo...</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        <div className="w-2/3 flex flex-col">
          {(selectedPaciente || selectedFisioterapeuta) ? (
            <>
              <div 
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4"
              >
                {messages.map((message) => {
                  console.log("Mensaje emisor ID:", message.emisor.id, "User ID:", user?.id?.toString());
                  const isOwnMessage = Number(message.emisor.id) === Number(user?.id);
                  console.log("¿Es mensaje propio?:", isOwnMessage);
                  return (
                    <div
                      key={message.id}
                      className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 ${isOwnMessage ? 'ml-2' : 'mr-2'}`}>
                          {renderProfileImage(message.emisor.profileImageUrl)}
                        </div>

                        {/* Mensaje */}
                        <div className="flex flex-col">
                          <span className={`text-xs text-gray-500 mb-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                            {message.emisor.username}
                          </span>
                          <div
                            className={`rounded-lg p-3 ${
                              isOwnMessage 
                                ? 'bg-blue-500 text-white rounded-br-none' 
                                : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                            }`}
                          >
                            {/* Contenido del mensaje */}
                            <div className="break-words">
                              {message.contenido}
                            </div>

                            {/* Archivos adjuntos */}
                            {message.adjuntoUrl && (
                              <div className="mt-2">
                                {renderFilePreview(message.adjuntoUrl, message.tipoAdjunto || '')}
                              </div>
                            )}

                            {/* Timestamp y estado */}
                            <div className={`flex items-center mt-1 text-xs ${
                              isOwnMessage ? 'text-blue-100 justify-end' : 'text-gray-500'
                            }`}>
                              <span>{formatTimestamp(message.fechaEnvio)}</span>
                              {isOwnMessage && (
                                <Check 
                                  className={`ml-1 ${
                                    message.leido 
                                      ? 'text-blue-100' 
                                      : 'text-blue-300'
                                  }`} 
                                  size={16} 
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t p-4 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <Paperclip className="text-gray-500 hover:text-gray-700" />
                  </label>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                  >
                    <Send size={20} />
                  </button>
                </form>
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    Archivo seleccionado: {selectedFile.name}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Selecciona un chat para comenzar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
