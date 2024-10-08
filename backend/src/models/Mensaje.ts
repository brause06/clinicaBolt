import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Paciente } from "./Paciente"

@Entity()
export class Mensaje {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    sender!: string;

    @Column()
    content!: string;

    @Column()
    timestamp!: Date;

    @Column()
    status!: 'sending' | 'sent' | 'delivered' | 'read';

    @Column({ nullable: true })
    fileName?: string;

    @Column({ nullable: true })
    fileUrl?: string;

    @ManyToOne(() => Paciente, paciente => paciente.mensajes)
    patient!: Paciente;
}
