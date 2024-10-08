import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Usuario } from "./Usuario";
import { Cita } from "./Cita";
import { Ejercicio } from "./Ejercicio";

@Entity("paciente")
export class Paciente {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => Usuario)
    @JoinColumn()
    usuario!: Usuario;

    @Column()
    name!: string;

    @Column()
    age!: number;

    @Column({ nullable: true })
    condition?: string;

    @Column({ nullable: true })
    lastAppointment?: Date;

    @OneToMany(() => Cita, cita => cita.patient)
    citas!: Cita[];

    @OneToMany(() => Ejercicio, ejercicio => ejercicio.patient)
    ejercicios!: Ejercicio[];

    
}
