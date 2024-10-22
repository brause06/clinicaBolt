import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Usuario } from "./Usuario";

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  message!: string;

  @Column()
  type!: 'info' | 'warning' | 'success';

  @Column({ default: false })
  read!: boolean;

  @ManyToOne(() => Usuario, user => user.notifications)
  user!: Usuario;

  @Column()
  createdAt!: Date;
}
