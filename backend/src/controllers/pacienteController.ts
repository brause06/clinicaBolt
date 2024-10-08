import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { Paciente } from "../models/Paciente"
import { Cita } from "../models/Cita";

const pacienteRepository = AppDataSource.getRepository(Paciente)

export const getAllPacientes = async (req: Request, res: Response) => {
    try {
        const pacientes = await pacienteRepository.find({
            relations: ['usuario']
        });
        console.log('Pacientes encontrados:', pacientes); 
        res.json(pacientes);
    } catch (error) {
        console.error('Error al obtener pacientes:', error);  
        res.status(500).json({ message: "Error al obtener pacientes" });
    }
}

export const createPaciente = async (req: Request, res: Response) => {
    try {
        const newPaciente = pacienteRepository.create(req.body)
        const result = await pacienteRepository.save(newPaciente)
        res.status(201).json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al crear paciente" })
    }
}

export const getPacienteById = async (req: Request, res: Response) => {
    try {
        const paciente = await pacienteRepository.findOneBy({ id: parseInt(req.params.id) })
        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" })
        }
        res.json(paciente)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener paciente" })
    }
}

export const updatePaciente = async (req: Request, res: Response) => {
    try {
        const paciente = await pacienteRepository.findOneBy({ id: parseInt(req.params.id) })
        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" })
        }
        pacienteRepository.merge(paciente, req.body)
        const result = await pacienteRepository.save(paciente)
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar paciente" })
    }
}

export const deletePaciente = async (req: Request, res: Response) => {
    try {
        const result = await pacienteRepository.delete(req.params.id)
        if (result.affected === 0) {
            return res.status(404).json({ message: "Paciente no encontrado" })
        }
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar paciente" })
    }
}

export const getPacienteCitas = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const citas = await AppDataSource.getRepository(Cita).find({
            where: { patient: { id: pacienteId } },
            relations: ["patient"]
        });
        
        if (citas.length === 0) {
            return res.status(404).json({ message: "No se encontraron citas para este paciente" });
        }
        
        res.json(citas);
    } catch (error) {
        console.error("Error al obtener las citas del paciente:", error);
        res.status(500).json({ message: "Error al obtener las citas del paciente" });
    }
};

// Implementa más funciones según sea necesario
