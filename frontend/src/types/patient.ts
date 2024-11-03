export interface Patient {
    id: number;
    name: string;
    age: number;
    condition?: string;
    lastAppointment?: string;
    userId: number;
    profileImageUrl?: string;
}
  
export interface CreatePatientData {
    name: string;
    age: number;
    condition?: string;
    userId: number;
    profileImageUrl?: string;
}
  
export interface UpdatePatientData {
    name?: string;
    age?: number;
    condition?: string;
    lastAppointment?: string;
    profileImageUrl?: string;
}
