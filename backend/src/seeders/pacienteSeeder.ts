import { AppDataSource } from "../config/database"
import { Paciente } from "../models/Paciente"

export const seedPacientes = async () => {
    const pacienteRepository = AppDataSource.getRepository(Paciente)

    const pacientes = [
        { name: 'Ana Martínez', age: 35, condition: 'Lumbalgia', lastAppointment: '2023-04-15' },
        { name: 'Carlos Rodríguez', age: 42, condition: 'Tendinitis', lastAppointment: '2023-04-20' },
        { name: 'María López', age: 28, condition: 'Esguince de tobillo', lastAppointment: '2023-04-18' }
    ]

    for (const paciente of pacientes) {
        const newPaciente = pacienteRepository.create(paciente)
        await pacienteRepository.save(newPaciente)
    }

    console.log("Pacientes insertados con éxito.")
}

