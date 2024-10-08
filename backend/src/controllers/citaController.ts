import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { Cita } from "../models/Cita"
import { Paciente } from "../models/Paciente"

const citaRepository = AppDataSource.getRepository(Cita)
const pacienteRepository = AppDataSource.getRepository(Paciente)

export const getAllCitas = async (req: Request, res: Response) => {
    try {
        const citas = await citaRepository.find({ relations: ["patient"] })
        res.json(citas)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener citas" })
    }
}

export const createCita = async (req: Request, res: Response) => {
    try {
        const { date, patientId, physicianName, status, notes } = req.body;

        // Buscar el paciente
        const paciente = await pacienteRepository.findOne({ where: { id: patientId } });
        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" });
        }

        const newCita = citaRepository.create({
            date: new Date(date),
            patient: paciente,
            physicianName,
            status,
            notes
        });

        const result = await citaRepository.save(newCita);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error al crear cita:", error);
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
        const cita = await citaRepository.findOneBy({ id: parseInt(req.params.id) })
        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" })
        }
        citaRepository.merge(cita, req.body)
        const result = await citaRepository.save(cita)
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar cita" })
    }
}

export const deleteCita = async (req: Request, res: Response) => {
    try {
        const result = await citaRepository.delete(req.params.id)
        if (result.affected === 0) {
            return res.status(404).json({ message: "Cita no encontrada" })
        }
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar cita" })
    }
}
