import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { PlanTratamiento } from "../models/PlanTratamiento"

const planTratamientoRepository = AppDataSource.getRepository(PlanTratamiento)

export const getAllPlanesTratamiento = async (req: Request, res: Response) => {
    try {
        const planesTratamiento = await planTratamientoRepository.find({ relations: ["patient"] })
        res.json(planesTratamiento)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener planes de tratamiento" })
    }
}

export const createPlanTratamiento = async (req: Request, res: Response) => {
    try {
        const newPlanTratamiento = planTratamientoRepository.create(req.body)
        const result = await planTratamientoRepository.save(newPlanTratamiento)
        res.status(201).json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al crear plan de tratamiento" })
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
