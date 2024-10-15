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

    @Column({ nullable: true })
    completionDate?: Date;

    @Column({ type: 'float', nullable: true })
    progressPercentage?: number;

    @Column({ nullable: true })
    notes?: string;

    @ManyToOne(() => Paciente, paciente => paciente.objetivos)
    patient!: Paciente;
}



    
