import api from './api';
import { UserRole } from '../types/user';

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  age?: number;
  // ... otros campos
}) => {
  console.log('Datos de registro enviados:', userData)
  const response = await api.post('/auth/register', userData);
  return response.data;
};
