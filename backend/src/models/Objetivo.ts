import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Paciente } from "./Paciente"

@Entity()
export class Objetivo {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    description!: string;

    @Column()
    targetDate!: Date;

    @Column()
    completed!: boolean;

    @ManyToOne(() => Paciente)
    patient!: Paciente;
}
