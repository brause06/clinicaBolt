import api from './api';
import { User } from '../types/user';

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData: User) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};