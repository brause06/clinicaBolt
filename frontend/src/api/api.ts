import axios from 'axios';
//import { UserRegistrationData } from '../types/user';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
