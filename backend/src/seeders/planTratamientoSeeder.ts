import { AppDataSource } from "../config/database"
import { PlanTratamiento } from "../models/PlanTratamiento"
import { Paciente } from "../models/Paciente"

export const seedPlanesTratamiento = async () => {
    const planTratamientoRepository = AppDataSource.getRepository(PlanTratamiento)
    const pacienteRepository = AppDataSource.getRepository(Paciente)

    const pacientes = await pacienteRepository.find()

    if (pacientes.length === 0) {
        console.log("No se encontraron pacientes. Asegúrate de ejecutar primero el seeder de pacientes.")
        return
    }

    const planesTratamiento = [
        { name: 'Terapia manual', duration: '30 minutos', frequency: '2 veces por semana' },
        { name: 'Ejercicios de fortalecimiento', duration: '45 minutos', frequency: '3 veces por semana' },
        { name: 'Electroterapia', duration: '20 minutos', frequency: '3 veces por semana' },
        { name: 'Estiramientos', duration: '15 minutos', frequency: 'Diario' }
    ]

    for (const paciente of pacientes) {
        for (const plan of planesTratamiento) {
            const newPlan = planTratamientoRepository.create({
                ...plan,
                patient: paciente
            })
            await planTratamientoRepository.save(newPlan)
        }
    }

    console.log("Planes de tratamiento insertados con éxito.")
}
