import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { Cita } from "../models/Cita"
import { Paciente } from "../models/Paciente"
import logger from '../utils/logger';
import { createAppointmentReminder } from './NotificationController';
import { createNotification } from './NotificationController';
import { Usuario } from "../models/Usuario";

const citaRepository = AppDataSource.getRepository(Cita)
const pacienteRepository = AppDataSource.getRepository(Paciente)

export const getAllCitas = async (req: Request, res: Response) => {
    try {
        const citas = await citaRepository.find({ 
            relations: ["patient", "therapist"]
        });
        logger.info(`Total de citas encontradas: ${citas.length}`);
        res.json(citas);
    } catch (error) {
        logger.error("Error al obtener citas:", error);
        res.status(500).json({ message: "Error al obtener citas" });
    }
}

export const createCita = async (req: Request, res: Response) => {
    try {
        const { date, patientId, physicianName, status, notes, duration, reasonForVisit, therapistId } = req.body;

        logger.info(`Creando cita con terapeuta ID: ${therapistId}`);

        const paciente = await pacienteRepository.findOne({ where: { id: patientId } });
        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" });
        }

        const fisioterapeuta = await AppDataSource.getRepository(Usuario).findOne({ 
            where: { id: therapistId } 
        });
        if (!fisioterapeuta) {
            return res.status(404).json({ message: "Fisioterapeuta no encontrado" });
        }

        const newCita = citaRepository.create({
            date: new Date(date),
            patient: paciente,
            therapist: fisioterapeuta,
            physicianName,
            status,
            notes,
            duration,
            reasonForVisit
        });

        const result = await citaRepository.save(newCita);
        logger.info(`Cita creada con ID: ${result.id}, terapeuta: ${result.therapist.id}`);

        // Crear recordatorio para la nueva cita
        await createAppointmentReminder(result.id);

        // Enviar notificación inmediata al paciente
        await createNotification(
            patientId,
            `Se ha programado una nueva cita para el ${new Date(date).toLocaleString()}`,
            'appointment'
        );

        res.status(201).json(result);
    } catch (error) {
        logger.error("Error al crear cita:", error);
        res.status(500).json({ message: "Error al crear cita" });
    }
}

export const getCitaById = async (req: Request, res: Response) => {
    try {
        const cita = await citaRepository.findOne({ 
            where: { id: parseInt(req.params.id) },
            relations: ["patient"]
        })
        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" })
        }
        res.json(cita)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener cita" })
    }
}

export const updateCita = async (req: Request, res: Response) => {
    try {
        const citaId = parseInt(req.params.id);
        const { date, patientId, physicianName, status, notes, duration, reasonForVisit, therapistId } = req.body;

        const cita = await citaRepository.findOne({ 
            where: { id: citaId }, 
            relations: ["patient", "therapist"] 
        });
        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }

        // Actualizar paciente si cambió
        if (patientId && patientId !== cita.patient.id) {
            const newPatient = await pacienteRepository.findOne({ where: { id: patientId } });
            if (!newPatient) {
                return res.status(404).json({ message: "Paciente no encontrado" });
            }
            cita.patient = newPatient;
        }

        // Actualizar fisioterapeuta si cambió
        if (therapistId) {
            const newTherapist = await AppDataSource.getRepository(Usuario).findOne({ 
                where: { id: therapistId } 
            });
            if (!newTherapist) {
                return res.status(404).json({ message: "Fisioterapeuta no encontrado" });
            }
            cita.therapist = newTherapist;
        }

        const oldDate = cita.date;
        cita.date = new Date(date) || cita.date;
        cita.physicianName = physicianName || cita.physicianName;
        cita.status = status || cita.status;
        cita.notes = notes || cita.notes;
        cita.duration = duration || cita.duration;
        cita.reasonForVisit = reasonForVisit || cita.reasonForVisit;

        const updatedCita = await citaRepository.save(cita);

        // Si la fecha de la cita ha cambiado, actualizar el recordatorio
        if (oldDate.getTime() !== updatedCita.date.getTime()) {
            await createAppointmentReminder(updatedCita.id);
        }

        res.json(updatedCita);
    } catch (error) {
        logger.error("Error al actualizar cita:", error);
        res.status(500).json({ message: "Error al actualizar cita" });
    }
}

export const deleteCita = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ message: "ID de cita inválido" });
        }

        const result = await citaRepository.delete(id);
        
        if (result.affected === 0) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }
        
        res.json({ message: "Cita eliminada con éxito" });
    } catch (error) {
        logger.error("Error al eliminar cita:", error);
        res.status(500).json({ message: "Error al eliminar cita" });
    }
}

export const getCitasByPatient = async (req: Request, res: Response) => {
    try {
        const patientId = parseInt(req.params.patientId);
        const citas = await citaRepository.find({
            where: { patient: { id: patientId } },
            relations: ["patient"]
        });
        res.json(citas);
    } catch (error) {
        logger.error("Error al obtener citas del paciente:", error);
        res.status(500).json({ message: "Error al obtener citas del paciente" });
    }
}

// Endpoint temporal para limpiar las citas (¡eliminar después!)
export const deleteAllCitas = async (req: Request, res: Response) => {
    try {
        // Usar SQL directo para asegurarnos de que se eliminen todas las citas
        await AppDataSource.createQueryRunner().query('DELETE FROM cita');
        
        logger.info('Todas las citas han sido eliminadas');
        res.json({ message: 'Todas las citas han sido eliminadas correctamente' });
    } catch (error) {
        logger.error("Error al eliminar todas las citas:", error);
        res.status(500).json({ 
            message: "Error al eliminar todas las citas",
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}

// Endpoint temporal para crear citas de prueba (¡eliminar después!)
export const createTestCitas = async (req: Request, res: Response) => {
    try {
        console.log('Recibida petición para crear citas de prueba');
        const therapistId = 10; // El ID del fisioterapeuta

        const fisioterapeuta = await AppDataSource.getRepository(Usuario).findOne({ 
            where: { id: therapistId } 
        });
        console.log('Fisioterapeuta encontrado:', fisioterapeuta ? 'Sí' : 'No');

        if (!fisioterapeuta) {
            return res.status(404).json({ message: "Fisioterapeuta no encontrado" });
        }

        // Buscar o crear un paciente de prueba
        let paciente = await pacienteRepository.findOne({ 
            where: { name: 'Paciente de Prueba' } 
        });

        if (!paciente) {
            console.log('Creando paciente de prueba...');
            paciente = pacienteRepository.create({
                name: 'Paciente de Prueba',
                age: 30,
                condition: 'Condición de prueba',
                email: 'paciente.prueba@example.com',
                phone: '123456789',
                address: 'Dirección de prueba',
                emergencyContact: 'Contacto de emergencia',
                medicalHistory: 'Historia médica de prueba'
            });
            paciente = await pacienteRepository.save(paciente);
            console.log('Paciente de prueba creado con ID:', paciente.id);
        }

        const citasPrueba = [
            {
                date: new Date(),
                patient: paciente,
                therapist: fisioterapeuta,
                physicianName: fisioterapeuta.username,
                status: 'scheduled' as const,
                duration: 30,
                notes: 'Cita de prueba 2',
                reasonForVisit: 'Primera consulta'
            }
        ];

        console.log('Intentando guardar citas...');
        const citasCreadas = await citaRepository.save(citasPrueba);
        console.log(`${citasCreadas.length} citas de prueba creadas`);
        
        return res.status(201).json(citasCreadas);
    } catch (error) {
        console.error("Error detallado al crear citas de prueba:", error);
        return res.status(500).json({ 
            message: "Error al crear citas de prueba",
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}
