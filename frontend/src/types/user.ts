export enum UserRole {
    PACIENTE = 'PACIENTE',
    FISIOTERAPEUTA = 'FISIOTERAPEUTA',
    ADMIN = 'ADMIN'
  }
  
export interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string;
  role: string;
  specialization?: string;
  dateOfBirth?: string;
  address?: string;
  profileImageUrl?: string;
  }
