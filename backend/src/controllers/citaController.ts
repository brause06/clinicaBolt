import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { Cita } from "../models/Cita"
import { Paciente } from "../models/Paciente"
import logger from '../utils/logger';
import { createAppointmentReminder } from './NotificationController';
import { createNotification } from './NotificationController';

const citaRepository = AppDataSource.getRepository(Cita)
const pacienteRepository = AppDataSource.getRepository(Paciente)

export const getAllCitas = async (req: Request, res: Response) => {
    try {
        const citas = await citaRepository.find({ relations: ["patient"] })
        res.json(citas)
    } catch (error) {
        logger.error("Error al obtener citas:", error)
        res.status(500).json({ message: "Error al obtener citas" })
    }
}

export const createCita = async (req: Request, res: Response) => {
    try {
        const { date, patientId, physicianName, status, notes, duration, reasonForVisit } = req.body;

        const paciente = await pacienteRepository.findOne({ where: { id: patientId } });
        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" });
        }

        const newCita = citaRepository.create({
            date: new Date(date),
            patient: paciente,
            physicianName,
            status,
            notes,
            duration,
            reasonForVisit
        });

        const result = await citaRepository.save(newCita);

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
        const { date, patientId, physicianName, status, notes, duration, reasonForVisit } = req.body;

        const cita = await citaRepository.findOne({ where: { id: citaId }, relations: ["patient"] });
        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }

        if (patientId && patientId !== cita.patient.id) {
            const newPatient = await pacienteRepository.findOne({ where: { id: patientId } });
            if (!newPatient) {
                return res.status(404).json({ message: "Paciente no encontrado" });
            }
            cita.patient = newPatient;
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
        const citaId = parseInt(req.params.id);
        const cita = await citaRepository.findOne({ where: { id: citaId } });
        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }
        await citaRepository.remove(cita);
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
