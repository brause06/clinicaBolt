import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm"
import { Usuario } from "./Usuario"
import { Paciente } from "./Paciente"

@Entity()
export class Mensaje {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    contenido!: string;

    @CreateDateColumn()
    fechaEnvio!: Date;

    @ManyToOne(() => Usuario, usuario => usuario.mensajesEnviados)
    emisor!: Usuario;

    @ManyToOne(() => Usuario, usuario => usuario.mensajesRecibidos)
    receptor!: Usuario;

    @Column()
    leido!: boolean;

    @ManyToOne(() => Paciente, paciente => paciente.mensajes)
    paciente!: Paciente;
}
