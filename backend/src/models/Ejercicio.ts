import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Paciente } from "./Paciente"

@Entity()
export class Ejercicio {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    duration!: string;

    @Column()
    frequency!: string;

    @ManyToOne(() => Paciente, paciente => paciente.ejercicios)
    patient!: Paciente;
}
