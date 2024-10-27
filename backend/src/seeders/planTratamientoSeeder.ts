import { AppDataSource } from "../config/database"
import { PlanTratamiento, TipoTratamiento } from "../models/PlanTratamiento"
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
        { nombre: 'Terapia manual', tipoId: TipoTratamiento.TERAPIA_MANUAL, duracion: '30 minutos', frecuencia: '2 veces por semana' },
        { nombre: 'Ejercicios de fortalecimiento', tipoId: TipoTratamiento.GIMNASIA_TERAPEUTICA, duracion: '45 minutos', frecuencia: '3 veces por semana' },
        { nombre: 'Electroterapia', tipoId: TipoTratamiento.AGENTE_FISICO, duracion: '20 minutos', frecuencia: '3 veces por semana' },
        { nombre: 'Estiramientos', tipoId: TipoTratamiento.GIMNASIA_TERAPEUTICA, duracion: '15 minutos', frecuencia: 'Diario' }
    ]

    for (const paciente of pacientes) {
        for (const plan of planesTratamiento) {
            const nuevoPlan = planTratamientoRepository.create({
                name: plan.nombre,
                tipo: plan.tipoId, // Esto debería ser un string que coincida con los valores en TipoTratamiento
                duration: plan.duracion,
                frequency: plan.frecuencia,
                patient: paciente
            });

            try {
                await planTratamientoRepository.save(nuevoPlan);
                console.log(`Plan de tratamiento creado: ${nuevoPlan.name}`);
            } catch (error) {
                console.error(`Error al crear plan de tratamiento: ${plan.nombre}`, error);
            }
        }
    }

    console.log(`Se insertaron los planes de tratamiento con éxito.`)
}
