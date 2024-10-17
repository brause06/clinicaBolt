import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { UserRole } from "../types/roles"

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
        type: "varchar",
        enum: UserRole,
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
}
