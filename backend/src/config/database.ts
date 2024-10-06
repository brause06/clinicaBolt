import { DataSource } from "typeorm"
import { Paciente } from "../models/Paciente"
import { Usuario } from "../models/Usuario"
import { PlanTratamiento } from "../models/PlanTratamiento"
import { Ejercicio } from "../models/Ejercicio"
import { Progreso } from "../models/Progreso"
import { Cita } from "../models/Cita"
import { Objetivo } from "../models/Objetivo"
import { Mensaje } from "../models/Mensaje"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    entities: [Paciente, Usuario, PlanTratamiento, Ejercicio, Progreso, Cita, Objetivo, Mensaje],
    synchronize: true,
    logging: true,
})
