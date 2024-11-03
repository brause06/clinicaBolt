export enum UserRole {
    PACIENTE = 'paciente',
    FISIOTERAPEUTA = 'fisioterapeuta',
    ADMIN = 'admin'
}

export interface User {
    id: number;
    username: string;
    password: string;
    email: string;
    age?: number;
    phoneNumber?: string;
    role: UserRole;
    specialization?: string;
    dateOfBirth?: string;
    address?: string;
    profileImageUrl?: string;
}

export interface PacienteBasico {
    id: number;
    name: string;
    profileImageUrl?: string;
}
