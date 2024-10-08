import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { Paciente } from "../models/Paciente"
import { Cita } from "../models/Cita";
import { PlanTratamiento } from "../models/PlanTratamiento";
import { Objetivo } from "../models/Objetivo";
import { Progreso } from "../models/Progreso";
import { Mensaje } from "../models/Mensaje";

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

export const getPacientePlanTratamiento = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const planTratamiento = await AppDataSource.getRepository(PlanTratamiento).findOne({
            where: { patient: { id: pacienteId } },
            relations: ["patient"]
        });
        
        if (!planTratamiento) {
            return res.status(404).json({ message: "No se encontró plan de tratamiento para este paciente" });
        }
        
        res.json(planTratamiento);
    } catch (error) {
        console.error("Error al obtener el plan de tratamiento del paciente:", error);
        res.status(500).json({ message: "Error al obtener el plan de tratamiento del paciente" });
    }
};

export const getPacienteObjetivos = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const objetivos = await AppDataSource.getRepository(Objetivo).find({
            where: { patient: { id: pacienteId } },
            relations: ["patient"]
        });
        
        if (objetivos.length === 0) {
            return res.status(404).json({ message: "No se encontraron objetivos para este paciente" });
        }
        
        res.json(objetivos);
    } catch (error) {
        console.error("Error al obtener los objetivos del paciente:", error);
        res.status(500).json({ message: "Error al obtener los objetivos del paciente" });
    }
};

export const getPacienteProgresos = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const progresos = await AppDataSource.getRepository(Progreso).find({
            where: { patient: { id: pacienteId } },
            relations: ["patient"]
        });
        
        if (progresos.length === 0) {
            return res.status(404).json({ message: "No se encontraron progresos para este paciente" });
        }
        
        res.json(progresos);
    } catch (error) {
        console.error("Error al obtener los progresos del paciente:", error);
        res.status(500).json({ message: "Error al obtener los progresos del paciente" });
    }
};

export const getPacienteMensajes = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const mensajes = await AppDataSource.getRepository(Mensaje).find({
            where: { patient: { id: pacienteId } },
            relations: ["patient"]
        });
        
        if (mensajes.length === 0) {
            return res.status(404).json({ message: "No se encontraron mensajes para este paciente" });
        }
        
        res.json(mensajes);
    } catch (error) {
        console.error("Error al obtener los mensajes del paciente:", error);
        res.status(500).json({ message: "Error al obtener los mensajes del paciente" });
    }
};
// Implementa más funciones según sea necesario
