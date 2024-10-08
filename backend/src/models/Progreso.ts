import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Paciente } from "./Paciente"

@Entity()
export class Progreso {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    date!: Date;

    @Column()
    painLevel!: number;

    @Column()
    mobility!: number;

    @Column()
    strength!: number;

    @ManyToOne(() => Paciente, paciente => paciente.progresos)
    patient!: Paciente;
}



    

