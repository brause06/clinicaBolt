import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Paciente } from "./Paciente"

@Entity()
export class PlanTratamiento {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    duration!: string;

    @Column()
    frequency!: string;

    @ManyToOne(() => Paciente, paciente => paciente.planesTratamiento)
    patient!: Paciente;
}



    
