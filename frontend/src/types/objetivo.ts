export interface Objetivo {
  id: number;
  description: string;
  targetDate: string;
  completed: boolean;
  completionDate?: string;
  progressPercentage?: number;
  notes?: string;
  patientId: number;
}