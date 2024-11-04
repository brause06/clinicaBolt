import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Paciente } from "./Paciente"
import { Usuario } from "./Usuario"

@Entity()
export class Cita {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    date!: Date;

    @ManyToOne(() => Paciente, paciente => paciente.citas)
    patient!: Paciente;

    @ManyToOne(() => Usuario)
    therapist!: Usuario;

    @Column()
    physicianName!: string;

    @Column()
    status!: 'scheduled' | 'completed' | 'cancelled';

    @Column({ nullable: true })
    notes?: string;

    @Column({ default: 30 })
    duration!: number;

    @Column({ nullable: true })
    reasonForVisit?: string;
}
