import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
//import { UserRegistrationData } from '../types/user';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para actualizar el token
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;


//export const login = async (email: string, password: string) => {
  //const response = await fetch(`${API_URL}/auth/login`, {
    //method: 'POST',
    //headers: { 'Content-Type': 'application/json' },
    //body: JSON.stringify({ email, password }),
  //});
  //if (!response.ok) {
    //const errorData = await response.json();
    //throw new Error(errorData.message || 'Login failed');
  //}
  //return response.json();
//};

//export const register = async (userData: UserRegistrationData) => {
  //const response = await fetch(`${API_URL}/auth/register`, {
   // method: 'POST',
    //headers: { 'Content-Type': 'application/json' },
    //body: JSON.stringify(userData),
  //});
  //if (!response.ok) {
    //const errorData = await response.json();
   // throw new Error(errorData.message || 'Registration failed');
  //}
  //return response.json();
//};

// Añade más funciones para otras llamadas a la API según sea necesario

