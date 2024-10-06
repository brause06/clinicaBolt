import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Paciente } from "./Paciente"

@Entity()
export class Cita {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    date!: Date;

    @ManyToOne(() => Paciente)
    patient!: Paciente;

    @Column()
    physicianName!: string;

    @Column()
    status!: 'scheduled' | 'completed' | 'cancelled';

    @Column({ nullable: true })
    notes?: string;
}
