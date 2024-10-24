import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Usuario } from "./Usuario";

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  message!: string;

  @Column({
    type: "varchar",
    enum: ["info", "warning", "success", "appointment", "treatment"],
  })
  type!: 'info' | 'warning' | 'success' | 'appointment' | 'treatment';

  @Column({ default: false })
  read!: boolean;

  @ManyToOne(() => Usuario, user => user.notifications)
  user!: Usuario;

  @Column()
  createdAt!: Date;
}
