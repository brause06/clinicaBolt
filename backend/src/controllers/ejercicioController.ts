import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { Ejercicio } from "../models/Ejercicio"
import { Paciente } from "../models/Paciente"
import logger from '../utils/logger';

const ejercicioRepository = AppDataSource.getRepository(Ejercicio)
const pacienteRepository = AppDataSource.getRepository(Paciente)

export const getAllEjercicios = async (req: Request, res: Response) => {
    try {
        const ejercicios = await ejercicioRepository.find({ relations: ["patient"] })
        res.json(ejercicios)
    } catch (error) {
        logger.error("Error al obtener ejercicios:", error)
        res.status(500).json({ message: "Error al obtener ejercicios" })
    }
}

export const createEjercicio = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const { nombre, descripcion, duracion, frecuencia } = req.body;

        const paciente = await pacienteRepository.findOne({ where: { id: pacienteId } });
        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" });
        }

        const newEjercicio = ejercicioRepository.create({
            name: nombre,
            description: descripcion,
            duration: duracion,
            frequency: frecuencia,
            patient: paciente
        });

        const result = await ejercicioRepository.save(newEjercicio);
        
        // Transformar el resultado antes de enviarlo
        const ejercicioResponse = {
            id: result.id,
            nombre: result.name,
            descripcion: result.description,
            duracion: result.duration,
            frecuencia: result.frequency,
            paciente: result.patient
        };

        res.status(201).json(ejercicioResponse);
    } catch (error) {
        logger.error("Error al crear ejercicio:", error);
        res.status(500).json({ message: "Error al crear ejercicio" });
    }
}

export const getEjercicioById = async (req: Request, res: Response) => {
    try {
        const ejercicio = await ejercicioRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ["patient"]
        })
        if (!ejercicio) {
            return res.status(404).json({ message: "Ejercicio no encontrado" })
        }
        res.json(ejercicio)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener ejercicio" })
    }
}

export const updateEjercicio = async (req: Request, res: Response) => {
    try {
        const ejercicio = await ejercicioRepository.findOneBy({ id: parseInt(req.params.id) })
        if (!ejercicio) {
            return res.status(404).json({ message: "Ejercicio no encontrado" })
        }
        ejercicioRepository.merge(ejercicio, req.body)
        const result = await ejercicioRepository.save(ejercicio)
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar ejercicio" })
    }
}

export const deleteEjercicio = async (req: Request, res: Response) => {
    try {
        const result = await ejercicioRepository.delete(req.params.id)
        if (result.affected === 0) {
            return res.status(404).json({ message: "Ejercicio no encontrado" })
        }
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar ejercicio" })
    }
}

export const getEjerciciosByPatient = async (req: Request, res: Response) => {
    console.log("Received request for patient exercises");
    console.log("Request params:", req.params);
    console.log("Authenticated user:", req.user);
    
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        console.log("Parsed patient ID:", pacienteId);
        
        if (isNaN(pacienteId)) {
            console.log("Invalid patient ID");
            return res.status(400).json({ message: "ID de paciente no válido" });
        }

        const pacienteRepository = AppDataSource.getRepository(Paciente);
        const paciente = await pacienteRepository.findOne({
            where: { id: pacienteId },
            relations: ["ejercicios"]
        });

        console.log("Found patient:", paciente);

        if (!paciente) {
            console.log("Patient not found");
            return res.status(404).json({ message: "Paciente no encontrado" });
        }

        console.log("Exercises found:", paciente.ejercicios);
        res.json(paciente.ejercicios || []);
    } catch (error) {
        console.error("Error al obtener ejercicios del paciente:", error);
        res.status(500).json({ 
            message: "Error al obtener ejercicios del paciente", 
            error: error instanceof Error ? error.message : String(error) 
        });
    }
}

export const completeEjercicio = async (req: Request, res: Response) => {
  try {
    const ejercicioId = parseInt(req.params.id);
    const ejercicio = await ejercicioRepository.findOne({ where: { id: ejercicioId } });
    
    if (!ejercicio) {
      return res.status(404).json({ message: "Ejercicio no encontrado" });
    }

    ejercicio.completed = true;
    ejercicio.lastCompleted = new Date();

    const updatedEjercicio = await ejercicioRepository.save(ejercicio);
    res.json(updatedEjercicio);
  } catch (error) {
    console.error("Error al completar ejercicio:", error);
    res.status(500).json({ message: "Error al completar ejercicio" });
  }
};
