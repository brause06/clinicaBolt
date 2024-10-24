export interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: Date;
  type: "info" | "warning" | "success" | "appointment" | "treatment";
}

