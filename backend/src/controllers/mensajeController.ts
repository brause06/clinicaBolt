import { Request, Response, NextFunction } from "express"
import { AppDataSource } from "../config/database"
import { Mensaje } from "../models/Mensaje"
import { Usuario } from "../models/Usuario"
import { UserRole } from "../types/roles"

const mensajeRepository = AppDataSource.getRepository(Mensaje)
const usuarioRepository = AppDataSource.getRepository(Usuario)

export const getAllMensajes = async (req: Request, res: Response) => {
    try {
        const mensajes = await mensajeRepository.find({ relations: ["patient"] })
        res.json(mensajes)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener mensajes" })
    }
}

export const createMensaje = async (req: Request, res: Response) => {
    try {
        const newMensaje = mensajeRepository.create(req.body)
        const result = await mensajeRepository.save(newMensaje)
        res.status(201).json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al crear mensaje" })
    }
}

export const getMensajeById = async (req: Request, res: Response) => {
    try {
        const mensaje = await mensajeRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ["patient"]
        })
        if (!mensaje) {
            return res.status(404).json({ message: "Mensaje no encontrado" })
        }
        res.json(mensaje)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener mensaje" })
    }
}

export const updateMensaje = async (req: Request, res: Response) => {
    try {
        const mensaje = await mensajeRepository.findOneBy({ id: parseInt(req.params.id) })
        if (!mensaje) {
            return res.status(404).json({ message: "Mensaje no encontrado" })
        }
        mensajeRepository.merge(mensaje, req.body)
        const result = await mensajeRepository.save(mensaje)
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar mensaje" })
    }
}

export const deleteMensaje = async (req: Request, res: Response) => {
    try {
        const result = await mensajeRepository.delete(req.params.id)
        if (result.affected === 0) {
            return res.status(404).json({ message: "Mensaje no encontrado" })
        }
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar mensaje" })
    }
}

export const getPacienteMensajes = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const mensajes = await mensajeRepository.find({
            where: { receptor: { id: pacienteId } },
            relations: ["receptor", "emisor"]
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

export const getConversacion = async (req: Request, res: Response) => {
    try {
        const { emisorId, receptorId } = req.params
        const mensajes = await mensajeRepository.find({
            where: [
                { emisor: { id: parseInt(emisorId) }, receptor: { id: parseInt(receptorId) } },
                { emisor: { id: parseInt(receptorId) }, receptor: { id: parseInt(emisorId) } }
            ],
            order: { fechaEnvio: "ASC" },
            relations: ["emisor", "receptor"]
        })
        res.json(mensajes)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la conversación" })
    }
}

export const enviarMensaje = async (req: Request, res: Response) => {
    try {
        const { emisorId, receptorId } = req.params
        const { contenido } = req.body

        const emisor = await usuarioRepository.findOne({ where: { id: parseInt(emisorId) } })
        const receptor = await usuarioRepository.findOne({ where: { id: parseInt(receptorId) } })

        if (!emisor || !receptor) {
            return res.status(404).json({ message: "Usuario no encontrado" })
        }

        const nuevoMensaje = mensajeRepository.create({
            contenido,
            emisor,
            receptor,
            leido: false
        })

        await mensajeRepository.save(nuevoMensaje)
        res.status(201).json(nuevoMensaje)
    } catch (error) {
        res.status(500).json({ message: "Error al enviar el mensaje" })
    }
}


