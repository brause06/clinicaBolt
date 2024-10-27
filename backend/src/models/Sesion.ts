import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { PlanTratamiento } from "./PlanTratamiento"

@Entity()
export class Sesion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    fecha!: Date;

    @Column()
    duracion!: number; // en minutos

    @Column("text")
    notas!: string;

    @Column("text")
    evolucion!: string;

    @ManyToOne(() => PlanTratamiento, planTratamiento => planTratamiento.sesiones)
    planTratamiento!: PlanTratamiento;
}

