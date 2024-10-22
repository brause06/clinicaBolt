import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { Objetivo } from "../models/Objetivo"
import { Paciente } from "../models/Paciente"
import logger from '../utils/logger';

const objetivoRepository = AppDataSource.getRepository(Objetivo)
const pacienteRepository = AppDataSource.getRepository(Paciente)

export const getAllObjetivos = async (req: Request, res: Response) => {
    try {
        const objetivos = await objetivoRepository.find({ relations: ["patient"] })
        res.json(objetivos)
    } catch (error) {
        logger.error("Error al obtener objetivos:", error)
        res.status(500).json({ message: "Error al obtener objetivos" })
    }
}

export const createObjetivo = async (req: Request, res: Response) => {
    try {
        const { description, targetDate, patientId, notes, progressPercentage } = req.body;

        const paciente = await pacienteRepository.findOne({ where: { id: patientId } });
        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" });
        }

        const newObjetivo = objetivoRepository.create({
            description,
            targetDate: new Date(targetDate),
            completed: false,
            notes,
            progressPercentage,
            patient: paciente
        });

        const result = await objetivoRepository.save(newObjetivo);
        res.status(201).json(result);
    } catch (error) {
        logger.error("Error al crear objetivo:", error);
        res.status(500).json({ message: "Error al crear objetivo" });
    }
}

export const getObjetivoById = async (req: Request, res: Response) => {
    try {
        const objetivo = await objetivoRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ["patient"]
        })
        if (!objetivo) {
            return res.status(404).json({ message: "Objetivo no encontrado" })
        }
        res.json(objetivo)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener objetivo" })
    }
}

export const updateObjetivo = async (req: Request, res: Response) => {
    try {
        const objetivoId = parseInt(req.params.id);
        const { description, targetDate, completed, completionDate, progressPercentage, notes } = req.body;

        const objetivo = await objetivoRepository.findOne({ where: { id: objetivoId }, relations: ["patient"] });
        if (!objetivo) {
            return res.status(404).json({ message: "Objetivo no encontrado" });
        }

        objetivo.description = description || objetivo.description;
        objetivo.targetDate = targetDate ? new Date(targetDate) : objetivo.targetDate;
        objetivo.completed = completed !== undefined ? completed : objetivo.completed;
        objetivo.completionDate = completionDate ? new Date(completionDate) : objetivo.completionDate;
        objetivo.progressPercentage = progressPercentage !== undefined ? progressPercentage : objetivo.progressPercentage;
        objetivo.notes = notes || objetivo.notes;

        const updatedObjetivo = await objetivoRepository.save(objetivo);
        res.json(updatedObjetivo);
    } catch (error) {
        logger.error("Error al actualizar objetivo:", error);
        res.status(500).json({ message: "Error al actualizar objetivo" });
    }
}

export const deleteObjetivo = async (req: Request, res: Response) => {
    try {
        const objetivoId = parseInt(req.params.id);
        const objetivo = await objetivoRepository.findOne({ where: { id: objetivoId } });
        if (!objetivo) {
            return res.status(404).json({ message: "Objetivo no encontrado" });
        }
        await objetivoRepository.remove(objetivo);
        res.json({ message: "Objetivo eliminado con éxito" });
    } catch (error) {
        logger.error("Error al eliminar objetivo:", error);
        res.status(500).json({ message: "Error al eliminar objetivo" });
    }
}

export const getObjetivosByPatient = async (req: Request, res: Response) => {
    try {
        const patientId = parseInt(req.params.patientId);
        const objetivos = await objetivoRepository.find({
            where: { patient: { id: patientId } },
            relations: ["patient"]
        });
        res.json(objetivos);
    } catch (error) {
        logger.error("Error al obtener objetivos del paciente:", error);
        res.status(500).json({ message: "Error al obtener objetivos del paciente" });
    }
}