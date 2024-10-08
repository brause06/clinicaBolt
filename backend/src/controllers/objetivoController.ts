import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { Objetivo } from "../models/Objetivo"

const objetivoRepository = AppDataSource.getRepository(Objetivo)

export const getAllObjetivos = async (req: Request, res: Response) => {
    try {
        const objetivos = await objetivoRepository.find({ relations: ["patient"] })
        res.json(objetivos)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener objetivos" })
    }
}

export const createObjetivo = async (req: Request, res: Response) => {
    try {
        const newObjetivo = objetivoRepository.create(req.body)
        const result = await objetivoRepository.save(newObjetivo)
        res.status(201).json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al crear objetivo" })
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
        const objetivo = await objetivoRepository.findOneBy({ id: parseInt(req.params.id) })
        if (!objetivo) {
            return res.status(404).json({ message: "Objetivo no encontrado" })
        }
        objetivoRepository.merge(objetivo, req.body)
        const result = await objetivoRepository.save(objetivo)
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar objetivo" })
    }
}

export const deleteObjetivo = async (req: Request, res: Response) => {
    try {
        const result = await objetivoRepository.delete(req.params.id)
        if (result.affected === 0) {
            return res.status(404).json({ message: "Objetivo no encontrado" })
        }
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar objetivo" })
    }
}

export const getPacienteObjetivos = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const objetivos = await objetivoRepository.find({
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
