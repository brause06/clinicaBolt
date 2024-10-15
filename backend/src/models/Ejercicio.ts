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

    @Column({ nullable: true })
    videoUrl?: string;

    @Column({ nullable: true })
    imageUrl?: string;

    @Column({ default: false })
    completed!: boolean;

    @Column({ type: 'datetime', nullable: true })
    lastCompleted?: Date;

    @ManyToOne(() => Paciente, paciente => paciente.ejercicios)
    patient!: Paciente;
}
