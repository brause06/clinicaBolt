import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  exp: number;
  // Añade otros campos si son necesarios
}

export const checkTokenValidity = () => {
  const token = localStorage.getItem('authToken')
  if (token) {
    try {
      const decodedToken: DecodedToken = jwtDecode(token)
      const currentTime = Date.now() / 1000
      if (decodedToken.exp < currentTime) {
        // Token expirado, limpiar almacenamiento local y redirigir al home
        localStorage.clear()
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error al decodificar el token:', error)
      localStorage.clear()
      window.location.href = '/'
    }
  }
}
