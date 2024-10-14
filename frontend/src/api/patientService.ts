import api from './api';
import { Patient, CreatePatientData, UpdatePatientData } from '../types/patient';

export const getAllPatients = async (): Promise<Patient[]> => {
  const response = await api.get<Patient[]>('/pacientes');
  return response.data;
};

export const getPatientById = async (id: number): Promise<Patient> => {
  const response = await api.get<Patient>(`/pacientes/${id}`);
  return response.data;
};

export const createPatient = async (patientData: CreatePatientData): Promise<Patient> => {
  const response = await api.post<Patient>('/pacientes', patientData);
  return response.data;
};

export const updatePatient = async (id: number, patientData: UpdatePatientData): Promise<Patient> => {
  const response = await api.put<Patient>(`/pacientes/${id}`, patientData);
  return response.data;
};

export const deletePatient = async (id: number): Promise<void> => {
  await api.delete(`/pacientes/${id}`);
};