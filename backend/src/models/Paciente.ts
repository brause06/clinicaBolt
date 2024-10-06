import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Paciente {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    age!: number;

    @Column({ nullable: true })
    condition?: string;

    @Column({ nullable: true })
    lastAppointment?: Date;
}
