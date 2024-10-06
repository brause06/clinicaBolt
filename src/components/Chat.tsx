import React, { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, File, Check, Clock, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  file?: {
    name: string;
    url: string;
  };
}

interface Physiotherapist {
  id: string;
  name: string;
}

const Chat = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'Dr. García', content: 'Hola, ¿cómo va tu recuperación?', timestamp: new Date('2023-04-10T10:00:00'), status: 'read' },
    { id: '2', sender: 'Tú', content: 'Bastante bien, gracias. Los ejercicios están ayudando mucho.', timestamp: new Date('2023-04-10T10:05:00'), status: 'read' },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedPhysio, setSelectedPhysio] = useState<string>('')
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([
    { id: '1', name: 'Dr. García' },
    { id: '2', name: 'Dra. Rodríguez' },
    { id: '3', name: 'Dr. Martínez' },
  ])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if ((newMessage.trim() || file) && selectedPhysio) {
      const message: Message = {
        id: Date.now().toString(),
        sender: 'Tú',
        content: newMessage,
        timestamp: new Date(),
        status: 'sending'
      }
      if (file) {
        message.file = {
          name: file.name,
          url: URL.createObjectURL(file),
        }
      }
      setMessages([...messages, message])
      setNewMessage('')
      setFile(null)

      // Simular el envío del mensaje
      setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === message.id ? { ...msg, status: 'sent' } : msg
          )
        )
      }, 1000)

      // Simular la entrega del mensaje
      setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === message.id ? { ...msg, status: 'delivered' } : msg
          )
        )
      }, 2000)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderMessageStatus = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-4 h-4 text-gray-400" />
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />
      case 'delivered':
        return <Check className="w-4 h-4 text-blue-500" />
      case 'read':
        return <Check className="w-4 h-4 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-[600px] flex flex-col">
      <h2 className="text-2xl font-semibold mb-4">Chat con tu Fisioterapeuta</h2>
      {user?.role === 'patient' && (
        <div className="mb-4">
          <label htmlFor="physio-select" className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona un fisioterapeuta
          </label>
          <select
            id="physio-select"
            value={selectedPhysio}
            onChange={(e) => setSelectedPhysio(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Selecciona un fisioterapeuta</option>
            {physiotherapists.map((physio) => (
              <option key={physio.id} value={physio.id}>
                {physio.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex-grow overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'Tú' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-lg p-3 ${message.sender === 'Tú' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              <p className="font-bold">{message.sender}</p>
              <p>{message.content}</p>
              {message.file && (
                <a href={message.file.url} target="_blank" rel="noopener noreferrer" className="flex items-center mt-2 text-sm underline">
                  <File className="w-4 h-4 mr-1" />
                  {message.file.name}
                </a>
              )}
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs">{formatTimestamp(message.timestamp)}</p>
                {message.sender === 'Tú' && (
                  <div className="ml-2">{renderMessageStatus(message.status)}</div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-100 rounded-full">
          <Paperclip className="w-5 h-5 text-gray-500" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
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
      {file && (
        <div className="mt-2 text-sm text-gray-600">
          Archivo adjunto: {file.name}
        </div>
      )}
    </div>
  )
}

export default Chat