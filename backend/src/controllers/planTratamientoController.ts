import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { PlanTratamiento } from "../models/PlanTratamiento"
import { Paciente } from "../models/Paciente"
import logger from '../utils/logger';

const planTratamientoRepository = AppDataSource.getRepository(PlanTratamiento)
const pacienteRepository = AppDataSource.getRepository(Paciente)

export const getAllPlanesTratamiento = async (req: Request, res: Response) => {
    try {
        const planesTratamiento = await planTratamientoRepository.find({ relations: ["patient"] })
        res.json(planesTratamiento)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener planes de tratamiento" })
    }
}

export const getPlanTratamientoByPatient = async (req: Request, res: Response) => {
    try {
        const patientId = parseInt(req.params.patientId);
        const planTratamiento = await planTratamientoRepository.find({
            where: { patient: { id: patientId } },
            relations: ["patient"]
        });
        res.json(planTratamiento || []); // Asegura que siempre se devuelva un array
    } catch (error) {
        logger.error("Error al obtener plan de tratamiento:", error);
        res.status(500).json({ message: "Error al obtener plan de tratamiento" });
    }
};

export const createPlanTratamiento = async (req: Request, res: Response) => {
    try {
        const { name, duration, frequency, patientId } = req.body;
        const paciente = await pacienteRepository.findOne({ where: { id: patientId } });
        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" });
        }
        const newPlanTratamiento = planTratamientoRepository.create({
            name,
            duration,
            frequency,
            patient: paciente
        });
        const result = await planTratamientoRepository.save(newPlanTratamiento);
        res.status(201).json(result);
    } catch (error) {
        logger.error("Error al crear plan de tratamiento:", error);
        res.status(500).json({ message: "Error al crear plan de tratamiento" });
    }
}

export const getPlanTratamientoById = async (req: Request, res: Response) => {
    try {
        const planTratamiento = await planTratamientoRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ["patient"]
        })
        if (!planTratamiento) {
            return res.status(404).json({ message: "Plan de tratamiento no encontrado" })
        }
        res.json(planTratamiento)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener plan de tratamiento" })
    }
}

export const updatePlanTratamiento = async (req: Request, res: Response) => {
    try {
        const planTratamiento = await planTratamientoRepository.findOneBy({ id: parseInt(req.params.id) })
        if (!planTratamiento) {
            return res.status(404).json({ message: "Plan de tratamiento no encontrado" })
        }
        planTratamientoRepository.merge(planTratamiento, req.body)
        const result = await planTratamientoRepository.save(planTratamiento)
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar plan de tratamiento" })
    }
}

export const deletePlanTratamiento = async (req: Request, res: Response) => {
    try {
        const result = await planTratamientoRepository.delete(req.params.id)
        if (result.affected === 0) {
            return res.status(404).json({ message: "Plan de tratamiento no encontrado" })
        }
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar plan de tratamiento" })
    }
}

export const getPacientePlanesTratamiento = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        logger.log('Buscando planes de tratamiento para el paciente:', pacienteId);
        const planesTratamiento = await planTratamientoRepository.find({
            where: { patient: { id: pacienteId } },
            relations: ["patient"]
        });

        if (planesTratamiento.length === 0) {
            return res.status(404).json({ message: "No se encontraron planes de tratamiento para este paciente" });
        }

        res.json(planesTratamiento);
    } catch (error) {
        logger.error("Error al obtener los planes de tratamiento del paciente:", error);
        res.status(500).json({ message: "Error al obtener los planes de tratamiento del paciente" });
    }
};
