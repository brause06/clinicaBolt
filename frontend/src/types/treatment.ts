export enum TipoTratamiento {
  AGENTE_FISICO = "Agente Físico",
  TERAPIA_MANUAL = "Terapia Manual",
  GIMNASIA_TERAPEUTICA = "Gimnasia Terapéutica"
}

export interface Treatment {
  id: number;
  name: string;
  tipo: TipoTratamiento;
  duration: string;
  frequency: string;
  // ... otros campos que pueda tener
}
