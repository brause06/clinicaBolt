import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { Ejercicio } from "../models/Ejercicio"

const ejercicioRepository = AppDataSource.getRepository(Ejercicio)

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
        const newEjercicio = ejercicioRepository.create(req.body)
        const result = await ejercicioRepository.save(newEjercicio)
        res.status(201).json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al crear ejercicio" })
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
