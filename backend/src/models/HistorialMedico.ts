import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Paciente } from "./Paciente"

@Entity()
export class HistorialMedico {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    fecha!: Date;

    @Column()
    diagnostico!: string;

    @Column()
    tratamiento!: string;

    @ManyToOne(() => Paciente, paciente => paciente.historialMedico)
    paciente!: Paciente;
}
