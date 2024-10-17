import api from './api';

export interface Ejercicio {
  id: number;
  name: string;
  description: string;
  duration: number;
  frequency: string;
  patientId: number;
}

export const getEjerciciosByPatient = async (patientId: number): Promise<Ejercicio[]> => {
  const response = await api.get<Ejercicio[]>(`/ejercicios/patient/${patientId}`);
  return response.data;
};

export const createEjercicio = async (ejercicio: Omit<Ejercicio, 'id'>): Promise<Ejercicio> => {
  const response = await api.post<Ejercicio>('/ejercicios', ejercicio);
  return response.data;
};

export const updateEjercicio = async (id: number, ejercicio: Partial<Ejercicio>): Promise<Ejercicio> => {
  const response = await api.put<Ejercicio>(`/ejercicios/${id}`, ejercicio);
  return response.data;
};

export const deleteEjercicio = async (id: number): Promise<void> => {
  await api.delete(`/ejercicios/${id}`);
};

