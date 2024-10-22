import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Mensaje } from "./Mensaje"
import { UserRole } from "../types/roles"
import { Notification } from "./Notification"

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    username!: string

    @Column()
    email!: string

    @Column()
    password!: string

    @Column({
        type: "text",
        default: UserRole.PACIENTE
    })
    role!: UserRole

    @Column({ nullable: true })
    phoneNumber?: string

    @Column({ nullable: true })
    address?: string

    @Column({ type: 'date', nullable: true })
    dateOfBirth?: Date

    @Column({ nullable: true })
    specialization?: string

    @Column({ nullable: true })
    profileImageUrl?: string

    @OneToMany(() => Mensaje, mensaje => mensaje.emisor)
    mensajesEnviados!: Mensaje[];

    @OneToMany(() => Mensaje, mensaje => mensaje.receptor)
    mensajesRecibidos!: Mensaje[];

    @OneToMany(() => Notification, notification => notification.user)
    notifications!: Notification[];
}
