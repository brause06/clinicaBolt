export enum UserRole {
    PACIENTE = 'PACIENTE',
    FISIOTERAPEUTA = 'FISIOTERAPEUTA',
    ADMIN = 'ADMIN'
  }
  
export interface User {
    username: string;
    email: string;
    password: string;
    role: UserRole;
  }