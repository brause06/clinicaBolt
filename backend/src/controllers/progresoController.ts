import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { Progreso } from "../models/Progreso"

const progresoRepository = AppDataSource.getRepository(Progreso)

export const getAllProgresos = async (req: Request, res: Response) => {
    try {
        const progresos = await progresoRepository.find({ relations: ["patient"] })
        res.json(progresos)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener progresos" })
    }
}

export const createProgreso = async (req: Request, res: Response) => {
    try {
        const newProgreso = progresoRepository.create(req.body)
        const result = await progresoRepository.save(newProgreso)
        res.status(201).json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al crear progreso" })
    }
}

export const getProgresoById = async (req: Request, res: Response) => {
    try {
        const progreso = await progresoRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ["patient"]
        })
        if (!progreso) {
            return res.status(404).json({ message: "Progreso no encontrado" })
        }
        res.json(progreso)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener progreso" })
    }
}

export const updateProgreso = async (req: Request, res: Response) => {
    try {
        const progreso = await progresoRepository.findOneBy({ id: parseInt(req.params.id) })
        if (!progreso) {
            return res.status(404).json({ message: "Progreso no encontrado" })
        }
        progresoRepository.merge(progreso, req.body)
        const result = await progresoRepository.save(progreso)
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar progreso" })
    }
}

export const deleteProgreso = async (req: Request, res: Response) => {
    try {
        const result = await progresoRepository.delete(req.params.id)
        if (result.affected === 0) {
            return res.status(404).json({ message: "Progreso no encontrado" })
        }
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar progreso" })
    }
}
