import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { Ejercicio } from "../models/Ejercicio"
import { Paciente } from "../models/Paciente"

const ejercicioRepository = AppDataSource.getRepository(Ejercicio)
const pacienteRepository = AppDataSource.getRepository(Paciente)

export const getAllEjercicios = async (req: Request, res: Response) => {
    try {
        const ejercicios = await ejercicioRepository.find({ relations: ["patient"] })
        res.json(ejercicios)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener ejercicios" })
    }
}

export const createEjercicio = async (req: Request, res: Response) => {
    try {
        console.log("Datos recibidos:", req.body);
        const { name, description, duration, frequency, patientId } = req.body;

        console.log("Buscando paciente con ID:", patientId);
        const paciente = await pacienteRepository.findOne({ where: { id: patientId } });
        if (!paciente) {
            console.log("Paciente no encontrado");
            return res.status(404).json({ message: "Paciente no encontrado" });
        }
        console.log("Paciente encontrado:", paciente);

        const newEjercicio = ejercicioRepository.create({
            name,
            description,
            duration,
            frequency,
            patient: paciente
        });
        console.log("Nuevo ejercicio creado:", newEjercicio);

        const result = await ejercicioRepository.save(newEjercicio);
        console.log("Ejercicio guardado:", result);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error al crear ejercicio:", error);
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

export const getPacienteEjercicios = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        console.log("Buscando ejercicios para el paciente con ID:", pacienteId);

        const ejercicios = await ejercicioRepository.find({
            where: { patient: { id: pacienteId } },
            relations: ["patient"]
        });

        console.log("Ejercicios encontrados:", ejercicios);

        if (ejercicios.length === 0) {
            return res.status(404).json({ message: "No se encontraron ejercicios para este paciente" });
        }

        res.json(ejercicios);
    } catch (error) {
        console.error("Error al obtener los ejercicios del paciente:", error);
        res.status(500).json({ message: "Error al obtener los ejercicios del paciente" });
    }
};
