import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Facebook, Instagram, Twitter, User, Clipboard, Calendar, MessageCircle, Users, FileText, Clock, UserPlus, ArrowRight } from 'lucide-react'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Sección de bienvenida mejorada */}
        <section className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Bienvenido a FisioClínica
                </h1>
                <p className="text-xl mb-8 opacity-90">
                  Mejoramos tu experiencia en fisioterapia con tecnología avanzada y atención personalizada.
                </p>
                {isAuthenticated ? (
                  <Link to="/dashboard" className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-100 transition duration-300 inline-flex items-center">
                    Ir al Dashboard <ArrowRight className="ml-2" />
                  </Link>
                ) : (
                  <Link to="/register" className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-100 transition duration-300 inline-flex items-center">
                    Comienza Ahora <ArrowRight className="ml-2" />
                  </Link>
                )}
              </div>
              <div className="md:w-1/2">
                <img src="/img/images.png" alt="Fisioterapia en acción" className="rounded-lg shadow-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Sección de servicios mejorada */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold mb-12 text-center">Nuestros Servicios</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-6 text-blue-600">Para Pacientes</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="text-blue-500" />
                    <span>Accede a tu historial clínico completo</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="text-blue-500" />
                    <span>Programa y gestiona tus citas en línea</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clipboard className="text-blue-500" />
                    <span>Visualiza ejercicios personalizados con guías detalladas</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="text-blue-500" />
                    <span>Comunícate directamente con tu fisioterapeuta</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-6 text-green-600">Para Fisioterapeutas</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Users className="text-green-500" />
                    <span>Gestiona eficientemente tus pacientes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="text-green-500" />
                    <span>Crea y actualiza planes de tratamiento personalizados</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="text-green-500" />
                    <span>Administra tu agenda de citas de forma intuitiva</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <UserPlus className="text-green-500" />
                    <span>Colabora con otros profesionales de la salud</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de galería */}
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold mb-8 text-center">Nuestra Clínica</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="aspect-w-16 aspect-h-9 rounded-lg shadow-md overflow-hidden">
                <img src="/img/clinica2.jpg" alt="Instalaciones" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-w-16 aspect-h-9 rounded-lg shadow-md overflow-hidden">
                <img src="/img/clinica3.jpg" alt="Sala de tratamiento" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-w-16 aspect-h-9 rounded-lg shadow-md overflow-hidden">
                <img src="/img/clinica4.jpg" alt="Equipo médico" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">FisioClínica</h3>
              <p>Mejorando vidas a través de la fisioterapia avanzada.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contacto</h3>
              <p>José Enrique Rodó 1768, 11200 Montevideo</p>
              <p>Teléfono: 2400 8292</p>
              <p>Email: info@fisioclinica.com</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Síguenos</h3>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/ReactivaRd/?locale=es_LA" className="hover:text-blue-200"><Facebook /></a>
                <a href="https://www.instagram.com/reactivard/" className="hover:text-blue-200"><Instagram /></a>
                <a href="#" className="hover:text-blue-200"><Twitter /></a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; 2023 FisioClínica. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
