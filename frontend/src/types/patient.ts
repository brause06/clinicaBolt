export interface Patient {
    id: number;
    name: string;
    age: number;
    condition?: string;
    lastAppointment?: string;
    userId: number;
  }
  
  export interface CreatePatientData {
    name: string;
    age: number;
    condition?: string;
    userId: number;
  }
  
  export interface UpdatePatientData {
    name?: string;
    age?: number;
    condition?: string;
    lastAppointment?: string;
  }
