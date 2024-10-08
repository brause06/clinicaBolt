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
        type: "varchar",  // Cambiamos el tipo a varchar
        enum: UserRole,   // Mantenemos la validación de enum
        default: UserRole.PACIENTE
    })
    role!: UserRole
}
