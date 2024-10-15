import { AppDataSource } from "../config/database"
import { seedPacientes } from "./pacienteSeeder"
import { seedPlanesTratamiento } from "./planTratamientoSeeder"

AppDataSource.initialize().then(async () => {
    await seedPacientes()
    await seedPlanesTratamiento()
    console.log("Todos los seeders se han ejecutado con éxito.")
    process.exit(0)
}).catch(error => console.log(error))

