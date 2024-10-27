import { DataSource } from "typeorm"
import { Usuario } from "../models/Usuario"
import { Paciente } from "../models/Paciente"
import { PlanTratamiento } from "../models/PlanTratamiento"
import { Ejercicio } from "../models/Ejercicio"
import { Progreso } from "../models/Progreso"
import { Cita } from "../models/Cita"
import { Objetivo } from "../models/Objetivo"
import { Mensaje } from "../models/Mensaje"
import { HistorialMedico } from "../models/HistorialMedico"
import { Notification } from "../models/Notification"
import { Sesion } from "../models/Sesion"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    entities: [Usuario, Paciente, PlanTratamiento, Sesion, Ejercicio, Progreso, Cita, Objetivo, Mensaje, HistorialMedico, Notification],
    synchronize: true,
    logging: true,
})
