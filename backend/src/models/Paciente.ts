import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Usuario } from "./Usuario";
import { Cita } from "./Cita";
import { Ejercicio } from "./Ejercicio";
import { PlanTratamiento } from "./PlanTratamiento";
import { Objetivo } from "./Objetivo";
import { Progreso } from "./Progreso";
import { Mensaje } from "./Mensaje";
import { HistorialMedico } from "./HistorialMedico"

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

    @OneToMany(() => PlanTratamiento, planTratamiento => planTratamiento.patient)
    planesTratamiento!: PlanTratamiento[];

    @OneToMany(() => Objetivo, objetivo => objetivo.patient)
    objetivos!: Objetivo[];

    @OneToMany(() => Progreso, progreso => progreso.patient)
    progresos!: Progreso[];

    @OneToMany(() => Mensaje, mensaje => mensaje.paciente)
    mensajes!: Mensaje[];

    @OneToMany(() => HistorialMedico, historial => historial.paciente)
    historialMedico!: HistorialMedico[];

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true })
    emergencyContact?: string;

    @Column({ nullable: true })
    medicalHistory?: string;
}




