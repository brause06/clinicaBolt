import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Paciente } from "./Paciente"

@Entity()
export class Ejercicio {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    duration!: string;

    @Column()
    frequency!: string;

    @Column()
    completed!: boolean;

    @Column({ nullable: true })
    lastCompleted?: Date;

    @ManyToOne(() => Paciente)
    patient!: Paciente;
}
