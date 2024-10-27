import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm"
import { Paciente } from "./Paciente"
import { Sesion } from "./Sesion"

export enum TipoTratamiento {
  AGENTE_FISICO = "Agente Físico",
  TERAPIA_MANUAL = "Terapia Manual",
  GIMNASIA_TERAPEUTICA = "Gimnasia Terapéutica"
}

@Entity()
export class PlanTratamiento {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({
        type: "text",
        nullable: false
    })
    tipo!: TipoTratamiento;

    @Column()
    duration!: string;

    @Column()
    frequency!: string;

    @ManyToOne(() => Paciente, paciente => paciente.planesTratamiento)
    patient!: Paciente;

    @OneToMany(() => Sesion, sesion => sesion.planTratamiento)
    sesiones!: Sesion[];
}
